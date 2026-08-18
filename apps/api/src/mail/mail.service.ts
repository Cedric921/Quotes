import {
  Injectable,
  Logger,
  type OnModuleDestroy,
  type OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

import { passwordResetMail, type RenderedMail } from './templates';

const RESET_CODE_TTL_MINUTES = 15;

type PendingMail = {
  to: string;
  mail: RenderedMail;
  attempts: number;
};

/**
 * Tout ce que Focus envoie par e-mail, et ce qui se passe quand ça échoue.
 *
 * **Deux routes, et l'ordre compte.** L'API tourne sur Render, qui bloque les
 * ports 25, 465 et 587 sur ses instances gratuites. Le symptôme n'est pas une
 * erreur mais un timeout de connexion de deux minutes par message : rien ne
 * paraît mal configuré, le courrier ne part simplement jamais. Quand une clé
 * d'API est présente, le fournisseur est donc joint en HTTPS sur le 443, que
 * personne ne bloque. Le SMTP reste le repli et demeure le bon choix partout où
 * les ports sont ouverts — une boîte mail, un VPS, une instance payante.
 *
 * **Pas de fournisseur configuré n'est pas un crash.** Le message est
 * journalisé avec son code, le développeur le lit dans le terminal et le
 * produit continue de fonctionner.
 *
 * Un échec est réessayé trois fois avec un délai qui s'élargit. Un code de
 * réinitialisation qui n'arrive pas, c'est un compte perdu.
 */
@Injectable()
export class MailService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;
  private readonly timers = new Set<NodeJS.Timeout>();
  private destroyed = false;

  constructor(private readonly configService: ConfigService) {}

  private get brevoApiKey(): string | undefined {
    return this.configService.get<string>('BREVO_API_KEY');
  }

  private get from(): string {
    return (
      this.configService.get<string>('MAIL_FROM') ??
      this.configService.get<string>('SMTP_FROM') ??
      'Focus <noreply@focus.app>'
    );
  }

  /** De quoi renseigner `/health/stats` sans exposer la clé. */
  configured(): boolean {
    return Boolean(this.brevoApiKey || this.transporter);
  }

  provider(): 'brevo' | 'smtp' | 'none' {
    if (this.brevoApiKey) return 'brevo';
    return this.transporter ? 'smtp' : 'none';
  }

  onModuleInit() {
    if (this.brevoApiKey) {
      this.logger.log('[MailService] Sending through the Brevo HTTP API');
      return;
    }

    const host = this.configService.get<string>('SMTP_HOST');
    const port = this.configService.get<string>('SMTP_PORT');
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASSWORD');

    if (!host || !user || !pass) {
      this.logger.warn(
        '[MailService] No BREVO_API_KEY and no SMTP credentials — reset codes will only be logged',
      );
      return;
    }

    const portNumber = Number.parseInt(port ?? '587', 10);
    this.transporter = nodemailer.createTransport({
      host,
      port: portNumber,
      // 465 est du TLS implicite ; tout le reste démarre en clair et monte en
      // TLS, ce qu'attendent les fournisseurs STARTTLS.
      secure: portNumber === 465,
      auth: { user, pass },
      // Bornés, pour qu'un port bloqué coûte des secondes plutôt que des
      // minutes : la requête HTTP de l'utilisateur attend derrière.
      connectionTimeout: 15_000,
      greetingTimeout: 15_000,
      socketTimeout: 20_000,
    });
  }

  onModuleDestroy() {
    this.destroyed = true;
    for (const timer of this.timers) clearTimeout(timer);
    this.timers.clear();
    this.transporter?.close();
  }

  /**
   * Le code de réinitialisation, dans la langue de la personne.
   *
   * Ne rejette pas : l'appelant répond toujours la même chose, qu'un compte
   * existe ou non, et un échec d'envoi ne doit pas devenir un canal qui révèle
   * lequel des deux s'est produit. La réémission se fait en arrière-plan.
   */
  async sendPasswordResetCode(
    email: string,
    code: string,
    name?: string,
    locale?: string | null,
  ): Promise<void> {
    const mail = passwordResetMail({
      locale,
      code,
      name,
      ttlMinutes: RESET_CODE_TTL_MINUTES,
    });

    if (!this.configured()) {
      // Rien pour envoyer. Le terminal porte le code, le développement n'est
      // pas bloqué, et la production est à une variable d'environnement près.
      this.logger.log(
        `[MailService] (DEV) Reset code for ${email}: ${code} (expires in ${RESET_CODE_TTL_MINUTES} min)`,
      );
      return;
    }

    await this.deliver({ to: email, mail, attempts: 0 });
  }

  private async deliver(pending: PendingMail): Promise<void> {
    try {
      if (this.brevoApiKey) {
        await this.sendOverHttp(pending.to, pending.mail);
      } else {
        await this.transporter!.sendMail({
          from: this.from,
          to: pending.to,
          subject: pending.mail.subject,
          text: pending.mail.text,
          html: pending.mail.html,
        });
      }
      this.logger.log(
        `[MailService] Sent "${pending.mail.subject}" to ${pending.to}`,
      );
    } catch (error) {
      const attempts = pending.attempts + 1;
      const reason = (error as Error).message.slice(0, 300);
      this.logger.warn(
        `[MailService] Delivery to ${pending.to} failed (attempt ${attempts}): ${reason}`,
      );

      if (attempts >= 3 || this.destroyed) {
        this.logger.error(
          `[MailService] Giving up on ${pending.to} after ${attempts} attempts`,
        );
        return;
      }

      // Trente secondes, puis deux minutes. Un fournisseur qui nous limite
      // n'est pas aidé par un nouvel essai immédiat.
      const delay = attempts * attempts * 30_000;
      const timer = setTimeout(() => {
        this.timers.delete(timer);
        void this.deliver({ ...pending, attempts });
      }, delay);
      timer.unref();
      this.timers.add(timer);
    }
  }

  /**
   * Le même message, sur HTTPS plutôt que sur une socket.
   *
   * Sémantique identique au chemin SMTP à dessein : ça revient, ou ça lève avec
   * une raison que l'appelant journalise et réessaie. Rien au-dessus ne sait
   * quelle route le message a prise.
   *
   * Le refus du fournisseur est lu dans le corps plutôt que rapporté comme un
   * statut nu : « 400 » n'apprend rien à personne, tandis que « sender not
   * valid » nomme l'erreur que tout le monde commet — un `MAIL_FROM` qui n'est
   * pas l'adresse vérifiée chez Brevo.
   */
  private async sendOverHttp(to: string, mail: RenderedMail): Promise<void> {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        accept: 'application/json',
        'api-key': this.brevoApiKey as string,
      },
      body: JSON.stringify({
        sender: senderFrom(this.from),
        to: [{ email: to }],
        subject: mail.subject,
        textContent: mail.text,
        htmlContent: mail.html,
      }),
      // Un fournisseur qui a cessé de répondre ne doit pas retenir la requête
      // de l'utilisateur indéfiniment.
      signal: AbortSignal.timeout(20_000),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      throw new Error(
        `Brevo ${response.status}: ${detail.slice(0, 300) || response.statusText}`,
      );
    }
  }
}

/**
 * Découpe `Focus <noreply@focus.app>` en ce qu'attend l'API.
 *
 * SMTP prend la chaîne entière ; l'API veut l'adresse et le nom affiché dans
 * deux champs. Une adresse nue est tout aussi valable et reste sans nom plutôt
 * que de s'en voir inventer un.
 */
function senderFrom(from: string): { email: string; name?: string } {
  const angled = /^\s*(.*?)\s*<([^>]+)>\s*$/.exec(from);
  if (!angled) return { email: from.trim() };

  const name = angled[1].replace(/^"|"$/g, '').trim();
  return name ? { email: angled[2].trim(), name } : { email: angled[2].trim() };
}

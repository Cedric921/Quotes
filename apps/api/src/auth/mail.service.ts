import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private readonly configService: ConfigService) {
    this.initTransporter();
  }

  private initTransporter() {
    const host = this.configService.get<string>('SMTP_HOST');
    const port = this.configService.get<string>('SMTP_PORT');
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASSWORD');

    if (!host || !port || !user || !pass) {
      this.logger.warn(
        '[MailService] SMTP not configured. Password reset emails will be logged to the console only.',
      );
      return;
    }

    this.transporter = nodemailer.createTransport({
      host,
      port: parseInt(port, 10),
      secure: parseInt(port, 10) === 465,
      auth: { user, pass },
    });
  }

  async sendPasswordResetCode(
    email: string,
    code: string,
    name?: string,
  ): Promise<void> {
    const from =
      this.configService.get<string>('SMTP_FROM') ||
      'Focus <noreply@focus.app>';
    const subject = 'Focus — Code de réinitialisation de mot de passe';
    const greeting = name ? `Bonjour ${name},` : 'Bonjour,';
    const text = `${greeting}\n\nVotre code de réinitialisation est : ${code}\n\nCe code expire dans 15 minutes.\nSi vous n'êtes pas à l'origine de cette demande, ignorez ce message.\n\n— L'équipe Focus`;
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; color: #1f2937;">
        <h2 style="margin: 0 0 16px; font-size: 22px;">Réinitialisation du mot de passe</h2>
        <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.5;">${greeting}</p>
        <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.5;">Voici votre code de réinitialisation :</p>
        <div style="background: #111; color: #fff; font-size: 32px; letter-spacing: 8px; text-align: center; padding: 20px; border-radius: 12px; font-weight: 600;">${code}</div>
        <p style="margin: 24px 0 0; font-size: 13px; color: #6b7280; line-height: 1.5;">Ce code expire dans 15 minutes. Si vous n'êtes pas à l'origine de cette demande, ignorez ce message.</p>
        <p style="margin: 24px 0 0; font-size: 13px; color: #6b7280;">— L'équipe Focus</p>
      </div>
    `;

    if (!this.transporter) {
      this.logger.log(
        `[MailService] (DEV) Reset code for ${email}: ${code} (expires in 15 min)`,
      );
      return;
    }

    try {
      await this.transporter.sendMail({
        from,
        to: email,
        subject,
        text,
        html,
      });
      this.logger.log(`[MailService] Password reset code sent to ${email}`);
    } catch (error) {
      this.logger.error('[MailService] Failed to send reset code', error);
      throw error;
    }
  }
}

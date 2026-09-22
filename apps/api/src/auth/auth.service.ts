import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../mail/mail.service';
import * as bcrypt from 'bcrypt';
import { randomInt } from 'crypto';

const RESET_CODE_TTL_MS = 15 * 60 * 1000;

/**
 * Trois codes par quart d'heure et par adresse.
 *
 * Sans cette borne, l'endpoint est un moyen d'inonder la boite de n'importe
 * qui - et de bruler le quota d'envoi. La fenetre est volontairement plus large
 * que le temps qu'il faut pour se tromper une fois de mot de passe.
 */
const RESET_MAX_REQUESTS = 3;
const RESET_WINDOW_MS = 15 * 60 * 1000;

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  /**
   * En memoire, parce que l'API tourne sur une seule instance : une table pour
   * ca couterait une migration et deux requetes par demande. Si le service
   * passe un jour a plusieurs instances, ceci devient un compteur partage.
   */
  private readonly resetRequests = new Map<string, number[]>();

  private assertResetQuota(email: string): void {
    const now = Date.now();
    const recent = (this.resetRequests.get(email) ?? []).filter(
      (at) => now - at < RESET_WINDOW_MS,
    );

    if (recent.length >= RESET_MAX_REQUESTS) {
      throw new HttpException(
        'Too many reset requests. Please try again in a few minutes.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    recent.push(now);
    this.resetRequests.set(email, recent);

    // La table ne grandit pas indefiniment : les adresses dont la fenetre est
    // passee sont oubliees au passage suivant.
    if (this.resetRequests.size > 1000) {
      for (const [key, times] of this.resetRequests) {
        if (times.every((at) => now - at >= RESET_WINDOW_MS)) {
          this.resetRequests.delete(key);
        }
      }
    }
  }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);
    if (user && user.password && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, isAdmin: user.isAdmin };

    // Get full user data with likedQuotesCount
    const fullUser = await this.usersService.findOne(user.id);
    const { password, ...userWithoutPassword } = fullUser as any;

    return {
      access_token: this.jwtService.sign(payload),
      user: userWithoutPassword,
    };
  }

  async verifyPassword(userId: string, password: string): Promise<boolean> {
    const user = await this.usersService.findOne(userId);
    if (!user || !user.password) {
      return false;
    }
    return bcrypt.compare(password, user.password);
  }

  async forgotPassword(
    email: string,
    locale?: string,
  ): Promise<{ success: true }> {
    if (!email) {
      throw new BadRequestException('Email is required');
    }

    const normalizedEmail = email.trim().toLowerCase();
    this.assertResetQuota(normalizedEmail);

    // Seules les colonnes utilisees : inutile de tirer les relations d'un
    // utilisateur pour lui ecrire un code a six chiffres.
    const user = await this.usersRepository.findOne({
      where: { email: normalizedEmail },
      select: ['id', 'email', 'name', 'password'],
    });

    // Always respond with success to avoid leaking whether the email exists
    if (!user || !user.password) {
      return { success: true };
    }

    // `Math.random` est previsible ; un code de reinitialisation devinable
    // vaut un mot de passe donne.
    const code = String(randomInt(100000, 1000000));
    const hashedCode = await bcrypt.hash(code, 10);

    await this.usersRepository.update(user.id, {
      passwordResetCode: hashedCode,
      passwordResetExpires: new Date(Date.now() + RESET_CODE_TTL_MS),
    });

    try {
      await this.mailService.sendPasswordResetCode(
        user.email,
        code,
        user.name,
        locale,
      );
    } catch {
      // swallow — still return success to keep the response uniform
    }

    return { success: true };
  }

  async resetPassword(
    email: string,
    code: string,
    newPassword: string,
  ): Promise<{ success: true }> {
    if (!email || !code || !newPassword) {
      throw new BadRequestException(
        'Email, code and new password are required',
      );
    }
    if (newPassword.length < 6) {
      throw new BadRequestException(
        'Password must be at least 6 characters long',
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await this.usersRepository.findOne({
      where: { email: normalizedEmail },
      select: ['id', 'passwordResetCode', 'passwordResetExpires'],
    });

    if (
      !user ||
      !user.passwordResetCode ||
      !user.passwordResetExpires ||
      user.passwordResetExpires.getTime() < Date.now()
    ) {
      throw new UnauthorizedException('Invalid or expired reset code');
    }

    const isCodeValid = await bcrypt.compare(code, user.passwordResetCode);
    if (!isCodeValid) {
      throw new UnauthorizedException('Invalid or expired reset code');
    }

    // Un `update` plutot qu'un `save` : l'entite chargee ici est partielle, et
    // la reecrire entiere risquerait d'effacer ce qu'elle ne porte pas.
    await this.usersRepository.update(user.id, {
      password: await bcrypt.hash(newPassword, 10),
      passwordResetCode: null as unknown as undefined,
      passwordResetExpires: null as unknown as undefined,
    });

    // Le code a servi : la fenetre de quota se rouvre pour cette adresse.
    this.resetRequests.delete(normalizedEmail);

    return { success: true };
  }
}

import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { MailService } from './mail.service';
import * as bcrypt from 'bcrypt';

const RESET_CODE_TTL_MS = 15 * 60 * 1000;

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

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

  async forgotPassword(email: string): Promise<{ success: true }> {
    if (!email) {
      throw new BadRequestException('Email is required');
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await this.usersRepository.findOne({
      where: { email: normalizedEmail },
    });

    // Always respond with success to avoid leaking whether the email exists
    if (!user || !user.password) {
      return { success: true };
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const hashedCode = await bcrypt.hash(code, 10);

    user.passwordResetCode = hashedCode;
    user.passwordResetExpires = new Date(Date.now() + RESET_CODE_TTL_MS);
    await this.usersRepository.save(user);

    try {
      await this.mailService.sendPasswordResetCode(user.email, code, user.name);
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

    user.password = await bcrypt.hash(newPassword, 10);
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    await this.usersRepository.save(user);

    return { success: true };
  }
}

import {
  Controller,
  Post,
  UseGuards,
  Request,
  Body,
  UnauthorizedException,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';

interface AuthenticatedRequest extends ExpressRequest {
  user: {
    userId: string;
    email: string;
    isAdmin: boolean;
  };
}

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Request() req: AuthenticatedRequest) {
    return this.authService.login(req.user);
  }

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('verify-password')
  async verifyPassword(
    @Request() req: AuthenticatedRequest,
    @Body('password') password: string,
  ) {
    const isValid = await this.authService.verifyPassword(
      req.user.userId,
      password,
    );
    if (!isValid) {
      throw new UnauthorizedException('Invalid password');
    }
    return { success: true };
  }
}

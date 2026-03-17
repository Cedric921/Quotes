import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SocialService } from './social.service';
import { CreateSocialNetworkDto } from './dto/create-social-network.dto';
import { UpdateSocialNetworkDto } from './dto/update-social-network.dto';

interface AuthenticatedRequest extends ExpressRequest {
  user?: {
    userId: string;
    email: string;
    isAdmin: boolean;
  };
}

@Controller('social')
export class SocialController {
  constructor(private readonly socialService: SocialService) {}

  // Public endpoint - get active social networks for mobile
  @Get('active')
  async findAllActive() {
    return this.socialService.findAllActive();
  }

  // Admin endpoints
  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Request() req: AuthenticatedRequest) {
    if (!req.user?.isAdmin) {
      return this.socialService.findAllActive();
    }
    return this.socialService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body() dto: CreateSocialNetworkDto,
    @Request() req: AuthenticatedRequest,
  ) {
    if (!req.user?.isAdmin) {
      return { error: 'Unauthorized' };
    }
    return this.socialService.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.socialService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateSocialNetworkDto,
    @Request() req: AuthenticatedRequest,
  ) {
    if (!req.user?.isAdmin) {
      return { error: 'Unauthorized' };
    }
    return this.socialService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/toggle-active')
  async toggleActive(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    if (!req.user?.isAdmin) {
      return { error: 'Unauthorized' };
    }
    return this.socialService.toggleActive(id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    if (!req.user?.isAdmin) {
      return { error: 'Unauthorized' };
    }
    await this.socialService.remove(id);
    return { success: true };
  }
}

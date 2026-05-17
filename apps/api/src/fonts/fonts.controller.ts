import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
  ForbiddenException,
  Request,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FontsService } from './fonts.service';
import { CreateFontDto, UpdateFontDto } from './dto';

interface AuthenticatedRequest extends ExpressRequest {
  user: {
    userId: string;
    email: string;
    isAdmin: boolean;
  };
}

@Controller('fonts')
export class FontsController {
  constructor(private readonly fontsService: FontsService) {}

  // Public endpoint - Get active fonts for mobile app
  @Get('active')
  findActive() {
    return this.fontsService.findActive();
  }

  // Public endpoint - Get the font marked as default (used on first launch)
  @Get('default')
  findDefault() {
    return this.fontsService.findDefault();
  }

  // Admin endpoints
  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Request() req: AuthenticatedRequest) {
    if (!req.user.isAdmin) {
      throw new ForbiddenException('Admin access required');
    }
    return this.fontsService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    if (!req.user.isAdmin) {
      throw new ForbiddenException('Admin access required');
    }
    return this.fontsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body() createFontDto: CreateFontDto,
    @Request() req: AuthenticatedRequest,
  ) {
    if (!req.user.isAdmin) {
      throw new ForbiddenException('Admin access required');
    }
    return this.fontsService.create(createFontDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateFontDto: UpdateFontDto,
    @Request() req: AuthenticatedRequest,
  ) {
    if (!req.user.isAdmin) {
      throw new ForbiddenException('Admin access required');
    }
    return this.fontsService.update(id, updateFontDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    if (!req.user.isAdmin) {
      throw new ForbiddenException('Admin access required');
    }
    await this.fontsService.remove(id);
    return { message: 'Font deleted successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/toggle-active')
  async toggleActive(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    if (!req.user.isAdmin) {
      throw new ForbiddenException('Admin access required');
    }
    return this.fontsService.toggleActive(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('reorder')
  async reorder(
    @Body() body: { fontIds: string[] },
    @Request() req: AuthenticatedRequest,
  ) {
    if (!req.user.isAdmin) {
      throw new ForbiddenException('Admin access required');
    }
    return this.fontsService.reorder(body.fontIds);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/set-default')
  async setDefault(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    if (!req.user.isAdmin) {
      throw new ForbiddenException('Admin access required');
    }
    return this.fontsService.setDefault(id);
  }
}

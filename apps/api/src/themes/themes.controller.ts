import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseUUIDPipe,
  ForbiddenException,
  Request,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request as ExpressRequest } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ThemesService } from './themes.service';
import { CreateThemeDto, UpdateThemeDto } from './dto';

interface AuthenticatedRequest extends ExpressRequest {
  user: {
    userId: string;
    email: string;
    isAdmin: boolean;
  };
}

@Controller('themes')
export class ThemesController {
  constructor(private readonly themesService: ThemesService) {}

  // Public endpoint - Get active themes for mobile app
  @Get('active')
  findActive() {
    return this.themesService.findActive();
  }

  // Public endpoint - Get the theme marked as default (used on first launch)
  @Get('default')
  findDefault() {
    return this.themesService.findDefault();
  }

  // Admin endpoints
  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Request() req: AuthenticatedRequest) {
    if (!req.user.isAdmin) {
      throw new ForbiddenException('Admin access required');
    }
    return this.themesService.findAll();
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
    return this.themesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Body() createThemeDto: CreateThemeDto,
    @UploadedFile() file: Express.Multer.File,
    @Request() req: AuthenticatedRequest,
  ) {
    if (!req.user.isAdmin) {
      throw new ForbiddenException('Admin access required');
    }
    return this.themesService.create(createThemeDto, file);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateThemeDto: UpdateThemeDto,
    @UploadedFile() file: Express.Multer.File,
    @Request() req: AuthenticatedRequest,
  ) {
    if (!req.user.isAdmin) {
      throw new ForbiddenException('Admin access required');
    }
    return this.themesService.update(id, updateThemeDto, file);
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
    return this.themesService.remove(id);
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
    return this.themesService.toggleActive(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('reorder')
  async reorder(
    @Body('themeIds') themeIds: string[],
    @Request() req: AuthenticatedRequest,
  ) {
    if (!req.user.isAdmin) {
      throw new ForbiddenException('Admin access required');
    }
    return this.themesService.reorder(themeIds);
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
    return this.themesService.setDefault(id);
  }
}

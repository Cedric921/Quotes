import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  Query,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateNotificationSettingsDto } from './dto/update-notification-settings.dto';
import { TrackActivityDto } from './dto/track-activity.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

interface AuthenticatedRequest extends ExpressRequest {
  user: {
    userId: string;
    email: string;
    isAdmin: boolean;
  };
}

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  // ==================== Notification Settings ====================

  @UseGuards(JwtAuthGuard)
  @Get('me/notification-settings')
  getNotificationSettings(@Request() req: AuthenticatedRequest) {
    return this.usersService.getNotificationSettings(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Put('me/notification-settings')
  updateNotificationSettings(
    @Request() req: AuthenticatedRequest,
    @Body() updateDto: UpdateNotificationSettingsDto,
  ) {
    return this.usersService.updateNotificationSettings(
      req.user.userId,
      updateDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/notification-settings/reset')
  resetNotificationSettings(@Request() req: AuthenticatedRequest) {
    return this.usersService.resetNotificationSettings(req.user.userId);
  }

  // ==================== User Activity ====================

  @UseGuards(JwtAuthGuard)
  @Post('me/activity')
  trackActivity(
    @Request() req: AuthenticatedRequest,
    @Body() trackDto: TrackActivityDto,
  ) {
    return this.usersService.trackActivity(req.user.userId, trackDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/activity')
  getUserActivity(
    @Request() req: AuthenticatedRequest,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.usersService.getUserActivity(
      req.user.userId,
      startDate,
      endDate,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/activity/stats')
  getActivityStats(
    @Request() req: AuthenticatedRequest,
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    const currentDate = new Date();
    const yearNum = year
      ? Number.parseInt(year, 10)
      : currentDate.getFullYear();
    const monthNum = month
      ? Number.parseInt(month, 10)
      : currentDate.getMonth() + 1;

    return this.usersService.getActivityStats(
      req.user.userId,
      yearNum,
      monthNum,
    );
  }

  // ==================== Admin Notification Settings ====================

  @UseGuards(JwtAuthGuard)
  @Get(':userId/notification-settings')
  async getNotificationSettingsAdmin(
    @Request() req: AuthenticatedRequest,
    @Param('userId') userId: string,
  ) {
    // Only admins can access other users' notification settings
    if (!req.user.isAdmin) {
      throw new ForbiddenException(
        'Only admins can access other users notification settings',
      );
    }
    return this.usersService.getNotificationSettings(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':userId/notification-settings')
  async updateNotificationSettingsAdmin(
    @Request() req: AuthenticatedRequest,
    @Param('userId') userId: string,
    @Body() updateDto: UpdateNotificationSettingsDto,
  ) {
    // Only admins can update other users' notification settings
    if (!req.user.isAdmin) {
      throw new ForbiddenException(
        'Only admins can update other users notification settings',
      );
    }
    return this.usersService.updateNotificationSettings(userId, updateDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':userId/notification-settings/reset')
  async resetNotificationSettingsAdmin(
    @Request() req: AuthenticatedRequest,
    @Param('userId') userId: string,
  ) {
    // Only admins can reset other users' notification settings
    if (!req.user.isAdmin) {
      throw new ForbiddenException(
        'Only admins can reset other users notification settings',
      );
    }
    return this.usersService.resetNotificationSettings(userId);
  }

  // ==================== Liked Quotes (Favorites) ====================

  @UseGuards(JwtAuthGuard)
  @Get('me/liked-quotes')
  async getMyLikedQuotes(@Request() req: AuthenticatedRequest) {
    return this.usersService.getLikedQuotes(req.user.userId);
  }

  // ==================== Profile Update ====================

  @UseGuards(JwtAuthGuard)
  @Patch('me/profile')
  async updateMyProfile(
    @Request() req: AuthenticatedRequest,
    @Body() updateDto: { name?: string; avatar?: string },
  ) {
    return this.usersService.updateProfile(req.user.userId, updateDto);
  }
}

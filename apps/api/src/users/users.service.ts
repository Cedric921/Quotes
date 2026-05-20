/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateNotificationSettingsDto } from './dto/update-notification-settings.dto';
import { TrackActivityDto } from './dto/track-activity.dto';
import { User } from './entities/user.entity';
import { UserNotificationSettings } from './entities/user-notification-settings.entity';
import { UserActivity } from './entities/user-activity.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(UserNotificationSettings)
    private notificationSettingsRepository: Repository<UserNotificationSettings>,
    @InjectRepository(UserActivity)
    private activityRepository: Repository<UserActivity>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.findOneByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const { password, ...rest } = createUserDto;
    const hashedPassword = password
      ? await bcrypt.hash(password, 10)
      : undefined;

    const user = this.usersRepository.create({
      ...rest,
      password: hashedPassword,
    });
    return this.usersRepository.save(user);
  }

  findAll() {
    return this.usersRepository.find();
  }

  /**
   * Calcule si l'utilisateur a un abonnement premium actif
   * Premium = isSubscribed ET subscriptionEndDate > maintenant
   */
  private calculateIsPremium(user: User): boolean {
    if (!user.isSubscribed) return false;
    if (!user.subscriptionEndDate) return false;
    const now = new Date();
    const endDate = new Date(user.subscriptionEndDate);
    return endDate > now;
  }

  async findOne(id: string) {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['likedQuotes'],
    });

    if (!user) return null;

    // Return user with likedQuotesCount and isPremium
    const { likedQuotes, password, ...userWithoutPassword } = user as any;
    return {
      ...userWithoutPassword,
      likedQuotesCount: likedQuotes?.length || 0,
      isPremium: this.calculateIsPremium(user),
    };
  }

  async findOneByEmail(email: string) {
    const user = await this.usersRepository.findOne({
      where: { email },
      relations: ['likedQuotes'],
    });

    if (!user) return null;

    // Return user with likedQuotesCount and isPremium
    const { likedQuotes, ...userWithoutLikedQuotes } = user as any;
    return {
      ...userWithoutLikedQuotes,
      likedQuotesCount: likedQuotes?.length || 0,
      isPremium: this.calculateIsPremium(user),
    };
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User | null> {
    const user: User = await this.findOne(id);
    if (!user) return null;

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    Object.assign(user, updateUserDto);
    return (await this.usersRepository.save(user)) as User;
  }

  remove(id: string) {
    return this.usersRepository.delete(id);
  }

  // ==================== Notification Settings ====================

  async getNotificationSettings(userId: string) {
    let settings = await this.notificationSettingsRepository.findOne({
      where: { userId },
    });

    // Create default settings if they don't exist
    if (!settings) {
      settings = this.notificationSettingsRepository.create({
        userId,
        enabled: false,
        startTime: '09:00',
        endTime: '18:00',
        maxNotificationsPerDay: 3,
        activeDays: '[0,1,2,3,4,5,6]',
        timezone: 'UTC',
        dailyNotificationTracker: '{"date":"","count":0,"times":[]}',
      });
      await this.notificationSettingsRepository.save(settings);
    }

    return settings;
  }

  async updateNotificationSettings(
    userId: string,
    updateDto: UpdateNotificationSettingsDto,
  ) {
    const settings = await this.notificationSettingsRepository.findOne({
      where: { userId },
    });

    // Convert activeDays array to JSON string if provided
    const updateData: Record<string, unknown> = { ...updateDto };
    if (updateDto.activeDays) {
      updateData.activeDays = JSON.stringify(updateDto.activeDays);
    }

    // Freemium cap: free users can request at most 2 notifications per day.
    // Premium users keep whatever value they sent.
    if (updateDto.maxNotificationsPerDay !== undefined) {
      const user = await this.usersRepository.findOne({
        where: { id: userId },
      });
      const isPremium = user ? this.calculateIsPremium(user) : false;
      if (!isPremium && updateDto.maxNotificationsPerDay > 2) {
        updateData.maxNotificationsPerDay = 2;
      }
    }

    if (!settings) {
      const newSettings = this.notificationSettingsRepository.create({
        userId,
        ...updateData,
      });
      return this.notificationSettingsRepository.save(newSettings);
    }

    Object.assign(settings, updateData);
    return this.notificationSettingsRepository.save(settings);
  }

  async resetNotificationSettings(userId: string) {
    const settings = await this.notificationSettingsRepository.findOne({
      where: { userId },
    });

    if (settings) {
      settings.enabled = false;
      settings.startTime = '09:00';
      settings.endTime = '18:00';
      settings.maxNotificationsPerDay = 3;
      settings.activeDays = '[0,1,2,3,4,5,6]';
      settings.timezone = 'UTC';
      settings.dailyNotificationTracker = '{"date":"","count":0,"times":[]}';
      return this.notificationSettingsRepository.save(settings);
    }

    return this.getNotificationSettings(userId);
  }

  // ==================== User Activity ====================

  async trackActivity(userId: string, trackDto: TrackActivityDto) {
    const { date } = trackDto;

    let activity = await this.activityRepository.findOne({
      where: { userId, date },
    });

    if (activity) {
      // Update existing activity
      activity.openCount += 1;
      activity.lastOpenedAt = new Date();
    } else {
      // Create new activity
      activity = this.activityRepository.create({
        userId,
        date,
        openCount: 1,
        lastOpenedAt: new Date(),
      });
    }

    return this.activityRepository.save(activity);
  }

  async getUserActivity(userId: string, startDate?: string, endDate?: string) {
    const query = this.activityRepository
      .createQueryBuilder('activity')
      .where('activity.userId = :userId', { userId });

    if (startDate) {
      query.andWhere('activity.date >= :startDate', { startDate });
    }

    if (endDate) {
      query.andWhere('activity.date <= :endDate', { endDate });
    }

    query.orderBy('activity.date', 'DESC');

    return query.getMany();
  }

  async getActivityStats(userId: string, year: number, month: number) {
    // Get first and last day of the month
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    const activities = await this.getUserActivity(userId, startDate, endDate);

    const totalDays = lastDay;
    const activeDays = activities.length;
    const totalOpens = activities.reduce(
      (sum, activity) => sum + activity.openCount,
      0,
    );

    return {
      year,
      month,
      totalDays,
      activeDays,
      inactiveDays: totalDays - activeDays,
      totalOpens,
      activities: activities.map((a) => ({
        date: a.date,
        openCount: a.openCount,
      })),
    };
  }

  // ==================== Liked Quotes (Favorites) ====================

  async getLikedQuotes(userId: string) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['likedQuotes', 'likedQuotes.topic'],
    });

    if (!user) return [];

    return user.likedQuotes.map((quote) => ({
      ...quote,
      isLiked: true,
    }));
  }

  // ==================== Profile Update ====================

  async updateProfile(
    userId: string,
    data: { name?: string; avatar?: string },
  ) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) return null;

    if (data.name !== undefined) user.name = data.name;
    if (data.avatar !== undefined) user.avatar = data.avatar;

    return this.usersRepository.save(user);
  }

  // ==================== Account Deletion ====================

  async deleteAccount(userId: string, password: string): Promise<void> {
    if (!password) {
      throw new BadRequestException('Password is required');
    }

    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify password
    if (!user.password) {
      throw new BadRequestException(
        'Cannot delete account: no password set (OAuth account)',
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    // Delete related data in order
    // 1. Delete notification settings
    await this.notificationSettingsRepository.delete({ userId });

    // 2. Delete user activities
    await this.activityRepository.delete({ userId });

    // 3. Delete the user (this will cascade delete liked quotes relation)
    await this.usersRepository.delete(userId);
  }
}

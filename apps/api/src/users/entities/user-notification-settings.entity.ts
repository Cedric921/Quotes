import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { User } from './user.entity';

@Entity()
export class UserNotificationSettings extends BaseEntity {
  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @Column()
  userId: string;

  @Column({ default: false })
  enabled: boolean;

  // Start time of the notification window (format "HH:mm", e.g., "09:00")
  @Column({ default: '09:00' })
  startTime: string;

  // End time of the notification window (format "HH:mm", e.g., "18:00")
  @Column({ default: '18:00' })
  endTime: string;

  // Maximum number of notifications per day (1-10)
  @Column({ default: 3 })
  maxNotificationsPerDay: number;

  // Days when notifications are enabled (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  // Stored as JSON array: [0,1,2,3,4,5,6] for all days
  @Column({
    type: 'text',
    default: '[0,1,2,3,4,5,6]',
  })
  activeDays: string;

  // Timezone of the user (e.g., "Europe/Paris", "America/New_York")
  @Column({ default: 'UTC' })
  timezone: string;

  // Track notifications sent today (reset daily)
  // Stored as JSON: { "date": "2024-01-15", "count": 2, "times": ["09:15", "14:30"] }
  @Column({
    type: 'text',
    default: '{"date":"","count":0,"times":[]}',
  })
  dailyNotificationTracker: string;
}

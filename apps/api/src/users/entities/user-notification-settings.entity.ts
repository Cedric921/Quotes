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

  // Notifications configuration
  // Stored as JSON array of objects: [{time: "09:00", days: [1,2,3,4,5]}, {time: "18:00", days: [0,6]}]
  // time: format "HH:mm" (e.g., "09:00")
  // days: array of day numbers (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  // Maximum 5 notifications
  @Column({
    type: 'text',
    default:
      '[{"time":"09:00","days":[0,1,2,3,4,5,6]},{"time":"18:00","days":[0,1,2,3,4,5,6]}]',
  })
  notifications: string;

  // Timezone of the user (e.g., "Europe/Paris", "America/New_York")
  @Column({ default: 'UTC' })
  timezone: string;
}

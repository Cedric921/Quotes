import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { User } from './user.entity';

@Entity()
@Index(['userId', 'date'], { unique: true }) // One activity record per user per day
export class UserActivity extends BaseEntity {
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @Column()
  userId: string;

  // Date of the activity (format: "YYYY-MM-DD")
  @Column({ type: 'date' })
  date: string;

  // Number of times the user opened the app on this day
  @Column({ default: 1 })
  openCount: number;

  // Last time the app was opened on this day
  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  lastOpenedAt: Date;
}


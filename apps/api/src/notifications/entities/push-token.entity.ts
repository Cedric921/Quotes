import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';

@Entity()
export class PushToken extends BaseEntity {
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @Index()
  @Column()
  userId: string;

  // Expo Push Token (e.g., "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]")
  @Index()
  @Column({ unique: true })
  token: string;

  // Device identifier (optional, for managing multiple devices)
  @Column({ nullable: true })
  deviceId: string;

  // Platform (ios, android)
  @Column({ nullable: true })
  platform: string;

  // Last time this token was used successfully
  @Column({ type: 'datetime', nullable: true })
  lastUsedAt: Date;

  // Whether this token is still valid
  @Column({ default: true })
  isActive: boolean;
}


import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';

@Entity()
export class PromoCode extends BaseEntity {
  @Column({ unique: true })
  code: string;

  @Column({ type: 'date' })
  expirationDate: Date;

  @Column({ comment: 'Number of days the user gets premium access' })
  durationDays: number;

  @Column({ default: 0, comment: 'Number of times this promo code has been used' })
  usageCount: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  description: string;
}

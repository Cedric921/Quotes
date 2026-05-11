import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { SubscriptionPlan } from './subscription-plan.entity';

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

export enum SubscriptionEnvironment {
  PRODUCTION = 'PRODUCTION',
  SANDBOX = 'SANDBOX',
}

@Entity()
export class Subscription extends BaseEntity {
  @Column()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  planId: string;

  @ManyToOne(() => SubscriptionPlan, (plan) => plan.subscriptions)
  @JoinColumn({ name: 'planId' })
  plan: SubscriptionPlan;

  @Column({
    type: 'varchar',
    default: SubscriptionStatus.ACTIVE,
  })
  status: SubscriptionStatus;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  // Stripe Payment Intent ID pour référence
  @Column({ nullable: true })
  stripePaymentIntentId: string;

  // Montant payé (en centimes)
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amountPaid: number;

  // PRODUCTION = real customer (Stripe live, App Store production, Play Store live)
  // SANDBOX = test data (Stripe test, App Store sandbox via TestFlight, Play Store test track)
  @Column({
    type: 'varchar',
    default: SubscriptionEnvironment.PRODUCTION,
  })
  environment: SubscriptionEnvironment;
}

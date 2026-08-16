import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "./base";
import { SubscriptionPlan } from "./subscription-plan";
import { User } from "./user";

export enum SubscriptionStatus {
  ACTIVE = "ACTIVE",
  EXPIRED = "EXPIRED",
  CANCELLED = "CANCELLED",
}

export enum SubscriptionEnvironment {
  PRODUCTION = "PRODUCTION",
  SANDBOX = "SANDBOX",
}

@Entity("subscription")
export class Subscription extends BaseEntity {
  @Column({ type: "varchar" })
  userId: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user: User;

  @Column({ type: "varchar" })
  planId: string;

  @ManyToOne(() => SubscriptionPlan, (plan) => plan.subscriptions)
  @JoinColumn({ name: "planId" })
  plan: SubscriptionPlan;

  @Column({ type: "varchar", default: SubscriptionStatus.ACTIVE })
  status: SubscriptionStatus;

  @Column({ type: "timestamp" })
  startDate: Date;

  @Column({ type: "timestamp" })
  endDate: Date;

  @Column({ type: "varchar", nullable: true })
  stripePaymentIntentId: string | null;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  amountPaid: number | string;

  @Column({ type: "varchar", default: SubscriptionEnvironment.PRODUCTION })
  environment: SubscriptionEnvironment;
}

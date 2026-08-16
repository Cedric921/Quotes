import { Column, Entity, OneToMany } from "typeorm";
import { BaseEntity } from "./base";
import { Subscription } from "./subscription";

@Entity("subscription_plan")
export class SubscriptionPlan extends BaseEntity {
  @Column({ type: "varchar" })
  name: string;

  @Column({ type: "text", nullable: true })
  description: string | null;

  /** Postgres returns decimals as strings; the API always has. */
  @Column({ type: "decimal", precision: 10, scale: 2 })
  price: number | string;

  @Column({ type: "integer", default: 1 })
  durationMonths: number;

  @Column({ type: "boolean", default: true })
  isActive: boolean;

  @OneToMany(() => Subscription, (subscription) => subscription.plan)
  subscriptions: Subscription[];
}

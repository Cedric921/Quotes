import { Column, Entity } from "typeorm";
import { BaseEntity } from "./base";

@Entity("app_config")
export class AppConfig extends BaseEntity {
  @Column({ type: "varchar", unique: true })
  key: string;

  @Column({ type: "text" })
  value: string;

  @Column({ type: "text", nullable: true })
  description: string | null;
}

export const CONFIG_KEYS = {
  FREEMIUM_DURATION_DAYS: "freemium_duration_days",
  MONTHLY_PRICE: "monthly_price",
  YEARLY_PRICE: "yearly_price",
  YEARLY_DISCOUNT_PERCENTAGE: "yearly_discount_percentage",
  STRIPE_MONTHLY_PRICE_ID: "stripe_monthly_price_id",
  STRIPE_YEARLY_PRICE_ID: "stripe_yearly_price_id",
} as const;

export const DEFAULT_CONFIG: Record<string, string> = {
  [CONFIG_KEYS.FREEMIUM_DURATION_DAYS]: "30",
  [CONFIG_KEYS.MONTHLY_PRICE]: "4.99",
  [CONFIG_KEYS.YEARLY_PRICE]: "49.99",
  [CONFIG_KEYS.YEARLY_DISCOUNT_PERCENTAGE]: "17",
  [CONFIG_KEYS.STRIPE_MONTHLY_PRICE_ID]: "",
  [CONFIG_KEYS.STRIPE_YEARLY_PRICE_ID]: "",
};

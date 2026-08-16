import { Column, Entity } from "typeorm";
import { BaseEntity } from "./base";

@Entity("promo_code")
export class PromoCode extends BaseEntity {
  @Column({ type: "varchar", unique: true })
  code: string;

  @Column({ type: "date" })
  expirationDate: Date | string;

  @Column({ type: "integer", comment: "Number of days the user gets premium access" })
  durationDays: number;

  @Column({ type: "integer", default: 0, comment: "Number of times this promo code has been used" })
  usageCount: number;

  @Column({ type: "boolean", default: true })
  isActive: boolean;

  @Column({ type: "text", nullable: true })
  description: string | null;
}

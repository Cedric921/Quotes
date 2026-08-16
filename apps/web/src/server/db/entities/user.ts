import { Column, Entity, JoinTable, ManyToMany } from "typeorm";
import { BaseEntity } from "./base";
import { Quote } from "./quote";
import { Topic } from "./topic";

@Entity("user")
export class User extends BaseEntity {
  @Column({ type: "varchar", unique: true })
  email: string;

  @Column({ type: "varchar", nullable: true })
  password: string | null;

  @Column({ type: "varchar", nullable: true })
  name: string | null;

  @Column({ type: "varchar", nullable: true })
  avatar: string | null;

  @Column({ type: "boolean", default: false })
  isAdmin: boolean;

  @Column({ type: "boolean", default: false })
  isSubscribed: boolean;

  @Column({ type: "date", nullable: true })
  subscriptionEndDate: Date | string | null;

  @Column({ type: "varchar", nullable: true })
  passwordResetCode: string | null;

  @Column({ type: "timestamp", nullable: true })
  passwordResetExpires: Date | null;

  @Column({ type: "varchar", nullable: true, comment: "Promo code used by this user for subscription" })
  usedPromoCode: string | null;

  @ManyToMany(() => Topic)
  @JoinTable()
  favoriteTopics: Topic[];

  @ManyToMany(() => Quote, (quote) => quote.likedBy)
  @JoinTable()
  likedQuotes: Quote[];
}

/** Columns never sent to a client: the NestJS API leaked all three. */
export const PRIVATE_USER_FIELDS = ["password", "passwordResetCode", "passwordResetExpires"] as const;

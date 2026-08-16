import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "./base";
import { User } from "./user";

@Entity("user_activity")
@Index(["userId", "date"], { unique: true })
export class UserActivity extends BaseEntity {
  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn()
  user: User;

  @Column({ type: "varchar" })
  userId: string;

  @Column({ type: "date" })
  date: string;

  @Column({ type: "integer", default: 1 })
  openCount: number;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  lastOpenedAt: Date;
}

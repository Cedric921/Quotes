import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "./base";
import { User } from "./user";

@Entity("push_token")
export class PushToken extends BaseEntity {
  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn()
  user: User;

  @Index()
  @Column({ type: "varchar" })
  userId: string;

  @Index()
  @Column({ type: "varchar", unique: true })
  token: string;

  @Column({ type: "varchar", nullable: true })
  deviceId: string | null;

  @Column({ type: "varchar", nullable: true })
  platform: string | null;

  @Column({ type: "timestamp", nullable: true })
  lastUsedAt: Date | null;

  @Column({ type: "boolean", default: true })
  isActive: boolean;
}

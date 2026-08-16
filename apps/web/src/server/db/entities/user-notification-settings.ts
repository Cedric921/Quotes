import { Column, Entity, JoinColumn, OneToOne } from "typeorm";
import { BaseEntity } from "./base";
import { User } from "./user";

@Entity("user_notification_settings")
export class UserNotificationSettings extends BaseEntity {
  @OneToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn()
  user: User;

  @Column({ type: "varchar" })
  userId: string;

  @Column({ type: "boolean", default: false })
  enabled: boolean;

  @Column({ type: "varchar", default: "09:00" })
  startTime: string;

  @Column({ type: "varchar", default: "18:00" })
  endTime: string;

  @Column({ type: "integer", default: 3 })
  maxNotificationsPerDay: number;

  /** JSON array of weekday numbers, 0 = Sunday. */
  @Column({ type: "text", default: "[0,1,2,3,4,5,6]" })
  activeDays: string;

  @Column({ type: "varchar", default: "UTC" })
  timezone: string;

  /** JSON `{date, count, times}`: what was sent today. */
  @Column({ type: "text", default: '{"date":"","count":0,"times":[]}' })
  dailyNotificationTracker: string;
}

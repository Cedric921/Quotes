import { Column, Entity } from "typeorm";
import { BaseEntity } from "./base";

export enum ContactMessageStatus {
  UNREAD = "UNREAD",
  READ = "READ",
}

@Entity("contact_messages")
export class ContactMessage extends BaseEntity {
  @Column({ type: "varchar" })
  name: string;

  @Column({ type: "varchar" })
  email: string;

  @Column({ type: "varchar" })
  subject: string;

  @Column({ type: "text" })
  message: string;

  // A varchar in the database (see the 1710300000000 migration), not a
  // Postgres enum as the NestJS entity claimed.
  @Column({ type: "varchar", default: ContactMessageStatus.UNREAD })
  status: ContactMessageStatus;

  @Column({ type: "uuid", nullable: true })
  userId: string | null;
}

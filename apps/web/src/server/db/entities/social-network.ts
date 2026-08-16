import { Column, Entity } from "typeorm";
import { BaseEntity } from "./base";

@Entity("social_networks")
export class SocialNetwork extends BaseEntity {
  @Column({ type: "varchar" })
  name: string;

  @Column({ type: "varchar" })
  url: string;

  @Column({ type: "varchar" })
  icon: string;

  @Column({ type: "varchar", nullable: true })
  color: string | null;

  @Column({ type: "boolean", default: true })
  isActive: boolean;

  @Column({ type: "integer", default: 0 })
  order: number;
}

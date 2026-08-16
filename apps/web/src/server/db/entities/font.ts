import { Column, Entity } from "typeorm";
import { BaseEntity } from "./base";

@Entity("font")
export class Font extends BaseEntity {
  @Column({ type: "varchar" })
  name: string;

  @Column({ type: "varchar" })
  fontFamily: string;

  @Column({ type: "varchar", nullable: true })
  description: string | null;

  @Column({ type: "varchar", nullable: true })
  previewText: string | null;

  @Column({ type: "boolean", default: true })
  isActive: boolean;

  @Column({ type: "integer", default: 0 })
  order: number;

  @Column({ type: "boolean", default: true })
  isPremium: boolean;

  @Column({ type: "boolean", default: false })
  isDefault: boolean;
}

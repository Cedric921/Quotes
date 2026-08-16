import { Column, Entity } from "typeorm";
import { BaseEntity } from "./base";

@Entity("theme")
export class Theme extends BaseEntity {
  @Column({ type: "varchar" })
  name: string;

  @Column({ type: "text", nullable: true })
  description: string | null;

  @Column({ type: "varchar" })
  imageUrl: string;

  @Column({ type: "varchar", nullable: true })
  thumbnailUrl: string | null;

  @Column({ type: "varchar", nullable: true })
  cloudinaryPublicId: string | null;

  @Column({ type: "boolean", default: true })
  isActive: boolean;

  @Column({ type: "integer", default: 0 })
  order: number;

  @Column({ type: "varchar", nullable: true })
  fontName: string | null;

  @Column({ type: "varchar", nullable: true })
  fontFamily: string | null;

  @Column({ type: "boolean", default: false })
  isPremium: boolean;

  @Column({ type: "boolean", default: false })
  isDefault: boolean;
}

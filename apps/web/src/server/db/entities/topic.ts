import { Column, Entity, OneToMany } from "typeorm";
import { BaseEntity } from "./base";
import { Quote } from "./quote";

@Entity("topic")
export class Topic extends BaseEntity {
  @Column({ type: "varchar" })
  name: string;

  @Column({ type: "varchar", nullable: true })
  title: string | null;

  @Column({ type: "varchar", nullable: true })
  description: string | null;

  @Column({ type: "varchar", nullable: true })
  icon: string | null;

  @Column({ type: "varchar", nullable: true })
  color: string | null;

  @Column({ type: "boolean", default: false })
  isPremium: boolean;

  @OneToMany(() => Quote, (quote) => quote.topic)
  quotes: Quote[];
}

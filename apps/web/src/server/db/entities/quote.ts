import { Column, Entity, ManyToMany, ManyToOne } from "typeorm";
import { BaseEntity } from "./base";
import { Topic } from "./topic";
import { User } from "./user";

@Entity("quote")
export class Quote extends BaseEntity {
  @Column({ type: "varchar" })
  text: string;

  @Column({ type: "varchar", nullable: true })
  author: string | null;

  @ManyToOne(() => Topic, (topic) => topic.quotes)
  topic: Topic | null;

  @ManyToMany(() => User, (user) => user.likedQuotes)
  likedBy: User[];
}

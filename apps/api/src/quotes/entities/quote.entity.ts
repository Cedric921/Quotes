import { Entity, Column, ManyToOne, ManyToMany } from 'typeorm';
import { Topic } from '../../topics/entities/topic.entity';
import { User } from '../../users/entities/user.entity';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity()
export class Quote extends BaseEntity {
  @Column()
  text: string;

  @Column({ nullable: true })
  author: string;

  @ManyToOne(() => Topic, (topic) => topic.quotes)
  topic: Topic;

  @ManyToMany(() => User, (user) => user.likedQuotes)
  likedBy: User[];
}

import { Entity, Column, ManyToOne } from 'typeorm';
import { Topic } from '../../topics/entities/topic.entity';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity()
export class Quote extends BaseEntity {
  @Column()
  text: string;

  @Column({ nullable: true })
  author: string;

  @ManyToOne(() => Topic, (topic) => topic.quotes)
  topic: Topic;
}

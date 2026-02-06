import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, DeleteDateColumn } from 'typeorm';
import { Topic } from '../../topics/entities/topic.entity';

@Entity()
export class Quote {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  text: string;

  @Column({ nullable: true })
  author: string;

  @DeleteDateColumn()
  deletedAt: Date;

  @ManyToOne(() => Topic, (topic) => topic.quotes)
  topic: Topic;
}

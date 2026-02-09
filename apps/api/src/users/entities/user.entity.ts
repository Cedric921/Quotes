import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Topic } from '../../topics/entities/topic.entity';
import { Quote } from '../../quotes/entities/quote.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  password?: string;

  @Column({ default: false })
  isAdmin: boolean;

  @Column({ default: false })
  isSubscribed: boolean;

  @Column({ type: 'date', nullable: true })
  subscriptionEndDate: Date;

  @ManyToMany(() => Topic)
  @JoinTable()
  favoriteTopics: Topic[];

  @ManyToMany(() => Quote)
  @JoinTable()
  likedQuotes: Quote[];
}

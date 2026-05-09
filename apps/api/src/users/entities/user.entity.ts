import { Entity, Column, ManyToMany, JoinTable } from 'typeorm';
import { Topic } from '../../topics/entities/topic.entity';
import { Quote } from '../../quotes/entities/quote.entity';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity()
export class User extends BaseEntity {
  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  password?: string;

  @Column({ nullable: true })
  name?: string;

  @Column({ nullable: true })
  avatar?: string;

  @Column({ default: false })
  isAdmin: boolean;

  @Column({ default: false })
  isSubscribed: boolean;

  @Column({ type: 'date', nullable: true })
  subscriptionEndDate: Date;

  @Column({ nullable: true })
  passwordResetCode?: string;

  @Column({ type: 'timestamp', nullable: true })
  passwordResetExpires?: Date;

  @ManyToMany(() => Topic)
  @JoinTable()
  favoriteTopics: Topic[];

  @ManyToMany(() => Quote)
  @JoinTable()
  likedQuotes: Quote[];
}

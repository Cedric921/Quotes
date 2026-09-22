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

  @Column({ nullable: true, comment: 'Promo code used by this user for subscription' })
  usedPromoCode?: string;

  @ManyToMany(() => Topic)
  @JoinTable()
  favoriteTopics: Topic[];

  /**
   * The owning side of the like.
   *
   * The inverse was missing: `Quote.likedBy` named this property, this one
   * named nothing back, so TypeORM never paired them and `likedBy` had no
   * junction table to join through. Every quote request from a signed-in user
   * came back 500 — the feed worked as a guest and broke at login.
   */
  @ManyToMany(() => Quote, (quote) => quote.likedBy)
  @JoinTable()
  likedQuotes: Quote[];
}

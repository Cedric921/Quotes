import { Entity, Column, OneToMany } from 'typeorm';
import { Quote } from '../../quotes/entities/quote.entity';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity()
export class Topic extends BaseEntity {
  @Column()
  name: string;

  @Column({ nullable: true })
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  icon: string;

  @Column({ nullable: true })
  color: string;

  @Column({ default: false })
  isPremium: boolean;

  @OneToMany(() => Quote, (quote) => quote.topic)
  quotes: Quote[];
}

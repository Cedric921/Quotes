import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  DeleteDateColumn,
} from 'typeorm';
import { Quote } from '../../quotes/entities/quote.entity';

@Entity()
export class Topic {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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

  @DeleteDateColumn()
  deletedAt: Date;

  @OneToMany(() => Quote, (quote) => quote.topic)
  quotes: Quote[];
}

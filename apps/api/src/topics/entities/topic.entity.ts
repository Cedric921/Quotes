import { Entity, PrimaryGeneratedColumn, Column, OneToMany, DeleteDateColumn } from 'typeorm';
import { Quote } from '../../quotes/entities/quote.entity';

@Entity()
export class Topic {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @DeleteDateColumn()
  deletedAt: Date;

  @OneToMany(() => Quote, (quote) => quote.topic)
  quotes: Quote[];
}

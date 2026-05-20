import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity()
export class Font extends BaseEntity {
  @Column()
  name: string;

  @Column()
  fontFamily: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  previewText: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 0 })
  order: number;

  @Column({ default: true })
  isPremium: boolean;

  @Column({ default: false })
  isDefault: boolean;
}

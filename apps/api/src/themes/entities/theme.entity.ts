import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity()
export class Theme extends BaseEntity {
  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  imageUrl: string;

  @Column({ nullable: true })
  thumbnailUrl: string;

  @Column({ nullable: true })
  cloudinaryPublicId: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 0 })
  order: number;

  // Font fields - embedded in theme
  @Column({ nullable: true })
  fontName: string;

  @Column({ nullable: true })
  fontFamily: string;

  @Column({ default: false })
  isPremium: boolean;

  @Column({ default: false })
  isDefault: boolean;
}

import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity('social_networks')
export class SocialNetwork extends BaseEntity {
  @Column()
  name: string;

  @Column()
  url: string;

  @Column()
  icon: string;

  @Column({ nullable: true })
  color: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 0 })
  order: number;
}


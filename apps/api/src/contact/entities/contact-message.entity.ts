import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

export enum ContactMessageStatus {
  UNREAD = 'UNREAD',
  READ = 'READ',
}

@Entity('contact_messages')
export class ContactMessage extends BaseEntity {
  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  subject: string;

  @Column({ type: 'text' })
  message: string;

  @Column({
    type: 'enum',
    enum: ContactMessageStatus,
    default: ContactMessageStatus.UNREAD,
  })
  status: ContactMessageStatus;

  @Column({ nullable: true })
  userId: string;
}


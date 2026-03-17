import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactMessage, ContactMessageStatus } from './entities/contact-message.entity';
import { CreateContactMessageDto } from './dto/create-contact-message.dto';
import { UpdateContactMessageDto } from './dto/update-contact-message.dto';

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(ContactMessage)
    private readonly contactMessageRepository: Repository<ContactMessage>,
  ) {}

  async create(dto: CreateContactMessageDto, userId?: string): Promise<ContactMessage> {
    const message = this.contactMessageRepository.create({
      ...dto,
      userId,
      status: ContactMessageStatus.UNREAD,
    });
    return this.contactMessageRepository.save(message);
  }

  async findAll(): Promise<ContactMessage[]> {
    return this.contactMessageRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<ContactMessage> {
    const message = await this.contactMessageRepository.findOne({ where: { id } });
    if (!message) {
      throw new NotFoundException(`Contact message with ID ${id} not found`);
    }
    return message;
  }

  async update(id: string, dto: UpdateContactMessageDto): Promise<ContactMessage> {
    const message = await this.findOne(id);
    Object.assign(message, dto);
    return this.contactMessageRepository.save(message);
  }

  async markAsRead(id: string): Promise<ContactMessage> {
    return this.update(id, { status: ContactMessageStatus.READ });
  }

  async markAsUnread(id: string): Promise<ContactMessage> {
    return this.update(id, { status: ContactMessageStatus.UNREAD });
  }

  async remove(id: string): Promise<void> {
    const message = await this.findOne(id);
    await this.contactMessageRepository.softDelete(message.id);
  }

  async getUnreadCount(): Promise<number> {
    return this.contactMessageRepository.count({
      where: { status: ContactMessageStatus.UNREAD },
    });
  }
}


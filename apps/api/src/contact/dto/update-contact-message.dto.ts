import { IsEnum, IsOptional } from 'class-validator';
import { ContactMessageStatus } from '../entities/contact-message.entity';

export class UpdateContactMessageDto {
  @IsEnum(ContactMessageStatus)
  @IsOptional()
  status?: ContactMessageStatus;
}


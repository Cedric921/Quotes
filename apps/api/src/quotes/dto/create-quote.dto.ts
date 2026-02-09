import { IsNotEmpty, IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateQuoteDto {
  @IsString()
  @IsNotEmpty()
  text: string;

  @IsString()
  @IsOptional()
  author?: string;

  @IsUUID()
  @IsOptional()
  topicId?: string;
}

import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateQuoteDto {
  @IsString()
  @IsNotEmpty()
  text: string;

  @IsString()
  @IsOptional()
  author?: string;

  @IsNumber()
  @IsOptional()
  topicId?: number;
}

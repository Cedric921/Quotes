import { IsArray, IsNotEmpty, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class QuoteImportItem {
  @IsString()
  @IsNotEmpty()
  text: string;

  @IsString()
  @IsOptional()
  author?: string;
}

export class BulkImportQuotesDto {
  @IsUUID()
  @IsNotEmpty()
  topicId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuoteImportItem)
  quotes: QuoteImportItem[];
}


import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateFontDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  fontFamily: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  previewText?: string;

  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @Transform(({ value }) => {
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? 0 : parsed;
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  order?: number;

  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return true; // Default to premium
  })
  @IsBoolean()
  @IsOptional()
  isPremium?: boolean;
}


import { IsString, IsInt, IsDateString, IsOptional, Min } from 'class-validator';

export class CreatePromoCodeDto {
  @IsString()
  code: string;

  @IsDateString()
  expirationDate: string;

  @IsInt()
  @Min(1)
  durationDays: number;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdatePromoCodeDto {
  @IsOptional()
  @IsDateString()
  expirationDate?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  durationDays?: number;

  @IsOptional()
  @IsString()
  description?: string;
}

import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, Max } from 'class-validator';

export class UpdateConfigDto {
  @IsNumber()
  @Min(1)
  @Max(365)
  @IsOptional()
  freemiumDurationDays?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  monthlyPrice?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  yearlyPrice?: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  yearlyDiscountPercentage?: number;

  @IsString()
  @IsOptional()
  stripeMonthlyPriceId?: string;

  @IsString()
  @IsOptional()
  stripeYearlyPriceId?: string;
}


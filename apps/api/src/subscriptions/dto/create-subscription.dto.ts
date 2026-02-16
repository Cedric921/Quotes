import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateSubscriptionDto {
  @IsString()
  @IsNotEmpty()
  planId: string;

  @IsString()
  @IsOptional()
  stripePaymentMethodId?: string;

  @IsBoolean()
  @IsOptional()
  autoRenew?: boolean;
}


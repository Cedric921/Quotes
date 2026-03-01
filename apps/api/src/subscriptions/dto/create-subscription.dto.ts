import { IsString, IsNotEmpty } from 'class-validator';

export class CreateSubscriptionDto {
  @IsString()
  @IsNotEmpty()
  planId: string;
}

// DTO pour créer un Payment Intent
export class CreatePaymentIntentDto {
  @IsString()
  @IsNotEmpty()
  planId: string;
}

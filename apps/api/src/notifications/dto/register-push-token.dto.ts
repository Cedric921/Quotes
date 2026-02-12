import { IsString, IsOptional, IsIn } from 'class-validator';

export class RegisterPushTokenDto {
  @IsString()
  token: string;

  @IsOptional()
  @IsString()
  deviceId?: string;

  @IsOptional()
  @IsIn(['ios', 'android'])
  platform?: string;
}


import {
  IsBoolean,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
  ArrayMaxSize,
  Matches,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class NotificationDto {
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'time must be in HH:mm format (e.g., "09:00")',
  })
  time: string;

  @IsArray()
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Max(6, { each: true })
  days: number[];
}

export class UpdateNotificationSettingsDto {
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NotificationDto)
  @ArrayMaxSize(5, { message: 'Maximum 5 notifications allowed' })
  notifications?: NotificationDto[];

  @IsOptional()
  @IsString()
  timezone?: string;
}

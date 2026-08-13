import {
  IsBoolean,
  IsOptional,
  IsString,
  IsArray,
  Matches,
  IsInt,
  Min,
  Max,
} from 'class-validator';

export class UpdateNotificationSettingsDto {
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'startTime must be in HH:mm format (e.g., "09:00")',
  })
  startTime?: string;

  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'endTime must be in HH:mm format (e.g., "18:00")',
  })
  endTime?: string;

  @IsOptional()
  @IsInt()
  @Min(1, { message: 'Minimum 1 notification per day' })
  @Max(20, { message: 'Maximum 20 notifications per day' })
  maxNotificationsPerDay?: number;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Max(6, { each: true })
  activeDays?: number[];

  @IsOptional()
  @IsString()
  timezone?: string;
}

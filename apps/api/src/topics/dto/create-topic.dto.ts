import { IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateTopicDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsString()
  @IsOptional()
  color?: string;

  @IsBoolean()
  @IsOptional()
  isPremium?: boolean;
}

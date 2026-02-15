import { IsDateString } from 'class-validator';

export class TrackActivityDto {
  @IsDateString()
  date: string; // Format: "YYYY-MM-DD"
}


import { IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class TranslateDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  text: string;

  @IsString()
  @IsNotEmpty()
  targetLang: string;

  @IsString()
  @IsOptional()
  sourceLang?: string = "EN";
}

export class TranslateResponseDto {
  translatedText: string;
  sourceLang: string;
  targetLang: string;
}


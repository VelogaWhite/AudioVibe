import { IsBoolean, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreatePromptLogRequestDTO {
  @IsString()
  userId: string;

  @IsString()
  rawPrompt: string;

  @IsOptional()
  @IsBoolean()
  isPreset?: boolean;

  @IsOptional()
  @IsString()
  presetName?: string;

  @IsNumber()
  @Min(0)
  @Max(1)
  targetDanceability: number;

  @IsNumber()
  @Min(0)
  @Max(1)
  targetValence: number;

  @IsNumber()
  @Min(0)
  @Max(1)
  targetEnergy: number;

  @IsNumber()
  @Min(0)
  @Max(1)
  targetAcousticness: number;

  @IsNumber()
  @Min(0)
  @Max(1)
  targetInstrumentalness: number;

  @IsNumber()
  @Min(0)
  @Max(1)
  targetLiveness: number;

  @IsNumber()
  @Min(0)
  @Max(1)
  targetSpeechiness: number;
}

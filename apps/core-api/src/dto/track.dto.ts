import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AudioFeaturesDTO } from './audio-features.dto.js';

export class TrackDTO {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  artistName: string;

  @IsString()
  @IsNotEmpty()
  albumName: string;

  @IsString()
  @IsNotEmpty()
  albumCoverUrl: string;

  @IsOptional()
  @IsString()
  previewUrl: string | null;

  @IsInt()
  @Min(0)
  durationMs: number;

  @IsInt()
  @Min(0)
  popularity: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => AudioFeaturesDTO)
  audioFeatures?: AudioFeaturesDTO | null;
}

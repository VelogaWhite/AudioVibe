import {
  IsInt,
  IsNotEmpty,
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

  @IsOptional()
  @IsString()
  albumName: string | null;

  @IsOptional()
  @IsString()
  albumCoverUrl: string | null;

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

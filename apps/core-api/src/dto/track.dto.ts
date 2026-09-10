import {
  IsNotEmpty,
  IsOptional,
  IsString,
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

  @ValidateNested()
  @Type(() => AudioFeaturesDTO)
  audioFeatures: AudioFeaturesDTO;
}
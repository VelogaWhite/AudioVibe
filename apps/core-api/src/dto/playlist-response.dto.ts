import {
  IsArray,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AudioFeaturesDTO } from './audio-features.dto.js';
import { TrackDTO } from './track.dto.js';

export class PlaylistResponseDTO {
  @IsString()
  @IsNotEmpty()
  playlistId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TrackDTO)
  tracks: TrackDTO[];

  @ValidateNested()
  @Type(() => AudioFeaturesDTO)
  averageAudioFeatures: AudioFeaturesDTO;
}
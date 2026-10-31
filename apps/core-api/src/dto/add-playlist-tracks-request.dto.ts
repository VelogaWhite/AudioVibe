import { IsArray, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { TrackDTO } from './track.dto.js';

export class AddPlaylistTracksRequestDTO {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TrackDTO)
  tracks?: TrackDTO[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  trackIds?: string[];
}

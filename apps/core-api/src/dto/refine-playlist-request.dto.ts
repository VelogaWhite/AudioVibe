import {
  IsArray,
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class RefinePlaylistRequestDTO {
  @IsString()
  @IsNotEmpty()
  playlistId: string;

  @IsString()
  @IsNotEmpty()
  refinePrompt: string;

  @IsArray()
  @IsString({ each: true })
  currentTrackIds: string[];
}
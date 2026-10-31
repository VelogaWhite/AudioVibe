import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class ReorderPlaylistTracksRequestDTO {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsArray()
  @IsString({ each: true })
  trackIds: string[];
}

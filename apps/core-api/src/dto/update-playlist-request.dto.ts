import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdatePlaylistRequestDTO {
  @IsString()
  userId: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}

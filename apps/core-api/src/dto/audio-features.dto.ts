import {
  IsNumber,
  Max,
  Min,
} from 'class-validator';

export class AudioFeaturesDTO {
  @IsNumber()
  @Min(0)
  @Max(1)
  danceability: number;

  @IsNumber()
  @Min(0)
  @Max(1)
  valence: number;

  @IsNumber()
  @Min(0)
  @Max(1)
  energy: number;

  @IsNumber()
  @Min(0)
  @Max(1)
  acousticness: number;

  @IsNumber()
  @Min(0)
  @Max(1)
  instrumentalness: number;

  @IsNumber()
  @Min(0)
  @Max(1)
  liveness: number;

  @IsNumber()
  @Min(0)
  @Max(1)
  speechiness: number;
}
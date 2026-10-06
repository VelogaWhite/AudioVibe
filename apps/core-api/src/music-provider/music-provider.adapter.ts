export type AudioFeaturesData = {
  trackId: string;
  danceability: number;
  valence: number;
  energy: number;
  acousticness: number;
  instrumentalness: number;
  liveness: number;
  speechiness: number;
  tempo: number;
  loudness: number;
};

export interface IMusicProviderAdapter {
  createPlaylist(
    userId: string,
    name: string,
    isPublic: boolean,
  ): Promise<string>;

  addTracksToPlaylist(
    userId: string,
    playlistId: string,
    trackIds: string[],
  ): Promise<boolean>;

  getAudioFeatures(
    userId: string,
    trackIds: string[],
  ): Promise<AudioFeaturesData[]>;

  searchTracks(
    userId: string,
    query: string,
    limit: number,
  ): Promise<unknown[]>;
}

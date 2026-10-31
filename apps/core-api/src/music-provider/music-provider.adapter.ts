export type SpotifyTrackMetadata = {
  id: string;
  title: string;
  artistName: string;
  albumName: string | null;
  albumCoverUrl: string | null;
  durationMs: number;
  popularity: number;
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

  getTracksMetadata(
    userId: string,
    trackIds: string[],
  ): Promise<SpotifyTrackMetadata[]>;

  searchTracks(
    userId: string,
    query: string,
    limit: number,
    offset?: number,
  ): Promise<unknown[]>;
}

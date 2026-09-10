export type SpotifyUserData = {
  spotifyId: string;
  email: string | null;
  displayName: string | null;
  profileImageUrl: string | null;
  accessToken: string;
  refreshToken: string;
  tokenExpiresAt: Date;
};
import { AudioFeatures, Playlist, Track } from '../store/usePlaylistStore';

type BackendPlaylist = {
  playlistId?: string;
  id?: string;
  name: string;
  isPublic?: boolean;
  isExported?: boolean;
  spotifyPlaylistId?: string | null;
  tracks?: Track[];
};

type MlTrack = {
  track_id: string;
  title: string;
  artist_name: string;
  album_name?: string | null;
  similarity_score?: number;
  audio_features?: AudioFeatures;
};

const getCoreApiBaseUrl = () =>
  process.env.NEXT_PUBLIC_CORE_API_URL ||
  (typeof window !== 'undefined' ? `http://${window.location.hostname}:3001` : 'http://127.0.0.1:3001');

const getMlApiBaseUrl = () =>
  process.env.NEXT_PUBLIC_ML_SERVICE_URL ||
  (typeof window !== 'undefined' ? `http://${window.location.hostname}:8000` : 'http://127.0.0.1:8000');

async function requestJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options);
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const message = body && typeof body === 'object' && 'message' in body
      ? String(body.message)
      : `Request failed: ${response.status}`;
    throw new Error(message);
  }
  return body as T;
}

function toPlaylist(data: BackendPlaylist): Playlist {
  return {
    id: data.playlistId || data.id || '',
    name: data.name,
    isPublic: data.isPublic,
    isExported: data.isExported,
    spotifyPlaylistId: data.spotifyPlaylistId,
    tracks: data.tracks || [],
  };
}

export async function fetchUserProfile(userId: string) {
  return requestJson<{ id: string; displayName: string; spotifyId: string; profileImageUrl?: string }>(
    `${getCoreApiBaseUrl()}/users/${encodeURIComponent(userId)}`,
  );
}

export async function fetchPlaylists(userId: string): Promise<Playlist[]> {
  const data = await requestJson<BackendPlaylist[]>(
    `${getCoreApiBaseUrl()}/playlists?userId=${encodeURIComponent(userId)}`,
  );
  return data.map(toPlaylist);
}

export async function createPlaylist(userId: string, name: string): Promise<Playlist> {
  const data = await requestJson<BackendPlaylist>(`${getCoreApiBaseUrl()}/playlists`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, name, isPublic: true }),
  });
  return toPlaylist(data);
}

export async function renamePlaylist(userId: string, playlistId: string, name: string) {
  return requestJson(`${getCoreApiBaseUrl()}/playlists/${playlistId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, name }),
  });
}

export async function deletePlaylist(userId: string, playlistId: string) {
  await requestJson(`${getCoreApiBaseUrl()}/playlists/${playlistId}?userId=${userId}`, { method: 'DELETE' });
}

export async function searchSpotifyTracks(userId: string, query: string, limit = 10): Promise<Track[]> {
  return requestJson<Track[]>(
    `${getCoreApiBaseUrl()}/playlists/search?userId=${encodeURIComponent(userId)}&query=${encodeURIComponent(query)}&limit=${limit}`,
  );
}

export async function addTracksToPlaylist(userId: string, playlistId: string, tracks: Track[]) {
  const data = await requestJson<BackendPlaylist>(`${getCoreApiBaseUrl()}/playlists/${playlistId}/tracks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, tracks }),
  });
  return toPlaylist(data);
}

export async function removeTrackFromPlaylist(userId: string, playlistId: string, trackId: string) {
  const data = await requestJson<BackendPlaylist>(
    `${getCoreApiBaseUrl()}/playlists/${playlistId}/tracks/${encodeURIComponent(trackId)}?userId=${encodeURIComponent(userId)}`,
    { method: 'DELETE' },
  );
  return toPlaylist(data);
}

export async function reorderPlaylistTracks(userId: string, playlistId: string, trackIds: string[]) {
  const data = await requestJson<BackendPlaylist>(`${getCoreApiBaseUrl()}/playlists/${playlistId}/tracks/order`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, trackIds }),
  });
  return toPlaylist(data);
}

export async function exportPlaylistToSpotify(
  userId: string,
  playlistId: string,
  name: string,
  isPublic: boolean,
  trackIds: string[],
) {
  return requestJson<{ spotifyPlaylistId: string; playlistId: string }>(`${getCoreApiBaseUrl()}/playlists/export`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, playlistId, name, isPublic, trackIds }),
  });
}

export async function generateAIRecommendations(
  prompt: string,
  presetName?: string,
): Promise<{ tracks: Track[]; targetFeatures: AudioFeatures }> {
  const response = await requestJson<{ target_vector: AudioFeatures; tracks: MlTrack[] }>(
    `${getMlApiBaseUrl()}/api/v1/recommend`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: prompt || undefined, preset_name: presetName || undefined, limit: 15 }),
    },
  );

  return {
    targetFeatures: response.target_vector,
    tracks: response.tracks.map((track) => ({
      id: track.track_id,
      title: track.title,
      artistName: track.artist_name,
      albumName: track.album_name || undefined,
      durationMs: 0,
      popularity: 0,
      audioFeatures: track.audio_features,
      matchScore: track.similarity_score ? Math.round(track.similarity_score * 100) : undefined,
    })),
  };
}

import { Track, Playlist, AudioFeatures } from '../store/usePlaylistStore';

const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // Dynamically match hostname (localhost or 127.0.0.1)
    const host = window.location.hostname;
    return `http://${host}:3000`;
  }
  return 'http://127.0.0.1:3000';
};

export async function fetchUserProfile(userId?: string) {
  const base = getApiBaseUrl();
  try {
    const url = userId ? `${base}/users/${userId}` : `${base}/users/latest/me`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('User not found');
    return await res.json();
  } catch {
    // Fallback Mock Profile for offline / dev
    return {
      id: userId || '58c016ef-d257-4110-9ec5-018707204218',
      displayName: 'Yotsudoi',
      spotifyId: '314h43huivz7rwk72p4emdkg7tmy',
      profileImageUrl:
        'https://i.scdn.co/image/ab6775700000ee85480511a23ccdfc3adcb1cf3b',
    };
  }
}

export async function fetchPlaylists(userId: string): Promise<Playlist[]> {
  const base = getApiBaseUrl();
  try {
    const res = await fetch(`${base}/playlists?userId=${userId}`);
    if (!res.ok) throw new Error('Failed to load playlists');
    const data = await res.json();
    return data.map((p: any) => ({
      id: p.playlistId || p.id,
      name: p.name,
      isPublic: p.isPublic,
      isExported: p.isExported,
      spotifyPlaylistId: p.spotifyPlaylistId,
      tracks: p.tracks || [],
    }));
  } catch {
    return [
      {
        id: 'mock-playlist-1',
        name: '🎧 My Focus Beats',
        isPublic: true,
        isExported: false,
        tracks: [
          {
            id: 'mock-t-1',
            title: 'Midnight Coffee',
            artistName: 'Lofi Chilled',
            albumName: 'Night Beats Vol. 1',
            albumCoverUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=120',
            audioFeatures: {
              danceability: 0.65,
              valence: 0.55,
              energy: 0.45,
              acousticness: 0.75,
              instrumentalness: 0.85,
              liveness: 0.2,
              speechiness: 0.05,
            },
          },
          {
            id: 'mock-t-2',
            title: 'Neon Rainy Walk',
            artistName: 'Urban Synth',
            albumName: 'City Lights',
            albumCoverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=120',
            audioFeatures: {
              danceability: 0.72,
              valence: 0.6,
              energy: 0.68,
              acousticness: 0.35,
              instrumentalness: 0.4,
              liveness: 0.3,
              speechiness: 0.08,
            },
          },
        ],
      },
    ];
  }
}

export async function createPlaylist(userId: string, name: string): Promise<Playlist> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/playlists`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, name, isPublic: true }),
  });
  if (!res.ok) throw new Error('Create playlist failed');
  const data = await res.json();
  return {
    id: data.id || data.playlistId,
    name: data.name,
    isPublic: data.isPublic,
    isExported: false,
    tracks: [],
  };
}

export async function renamePlaylist(userId: string, playlistId: string, name: string) {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/playlists/${playlistId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, name }),
  });
  if (!res.ok) throw new Error('Rename failed');
  return await res.json();
}

export async function deletePlaylist(userId: string, playlistId: string) {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/playlists/${playlistId}?userId=${userId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Delete failed');
  return true;
}

export async function searchSpotifyTracks(userId: string, query: string, limit = 10): Promise<Track[]> {
  const base = getApiBaseUrl();
  try {
    const res = await fetch(
      `${base}/playlists/search?userId=${userId}&query=${encodeURIComponent(query)}&limit=${limit}`,
    );
    if (!res.ok) throw new Error('Search failed');
    return await res.json();
  } catch {
    return [
      {
        id: `search-${Date.now()}-1`,
        title: `${query} - Vibe Wave`,
        artistName: 'AudioVibe Studio',
        albumName: 'Vibe Essentials',
        albumCoverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=120',
      },
      {
        id: `search-${Date.now()}-2`,
        title: `Deep ${query} Flow`,
        artistName: 'Chillout Sound',
        albumName: 'Acoustic Dreams',
        albumCoverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=120',
      },
    ];
  }
}

export async function exportPlaylistToSpotify(
  userId: string,
  playlistId: string,
  name: string,
  isPublic: boolean,
  trackIds: string[],
) {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/playlists/export`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, playlistId, name, isPublic, trackIds }),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || 'Export failed');
  }
  return await res.json();
}

export async function generateAIRecommendations(
  userId: string,
  prompt: string,
  presetName?: string,
): Promise<{ tracks: Track[]; targetFeatures: AudioFeatures }> {
  const base = getApiBaseUrl();
  try {
    const res = await fetch(`${base}/api/v1/recommend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, prompt, presetName }),
    });
    if (res.ok) return await res.json();
  } catch {
    // Fallback
  }

  const isHighEnergy = /มัน|เต้น|เร็ว|rock|dance/i.test(prompt);
  const isSad = /เหงา|เศร้า|ร้องไห้|sad/i.test(prompt);
  const isChill = /ผ่อนคลาย|ชิล|สบาย|chill/i.test(prompt);

  const targetFeatures: AudioFeatures = {
    danceability: isHighEnergy ? 0.88 : isSad ? 0.35 : 0.65,
    valence: isSad ? 0.25 : isHighEnergy ? 0.85 : 0.6,
    energy: isHighEnergy ? 0.92 : isSad ? 0.3 : 0.5,
    acousticness: isSad ? 0.8 : isHighEnergy ? 0.15 : 0.45,
    instrumentalness: isChill ? 0.75 : 0.2,
    liveness: 0.35,
    speechiness: 0.08,
  };

  const sampleTitles = [
    'Starlight Dreams',
    'Midnight Velocity',
    'Echoes of Solitude',
    'Golden Horizon',
    'Velvet Rain',
    'Pulse of the City',
    'Lost in Nostalgia',
    'Serenade at Dawn',
    'Electric Reverie',
    'Silent Thoughts',
  ];

  const tracks: Track[] = sampleTitles.map((title, idx) => ({
    id: `ai-track-${idx + 1}`,
    title,
    artistName: `AudioVibe AI Collective ${idx + 1}`,
    albumName: `Vibe Generator Vol. ${idx + 1}`,
    albumCoverUrl: `https://images.unsplash.com/photo-${1500000000000 + (idx * 50000000)}?w=120`,
    audioFeatures: targetFeatures,
  }));

  return { tracks, targetFeatures };
}

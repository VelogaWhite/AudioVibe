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
    return null;
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

  const isHighEnergy = /มัน|เต้น|เร็ว|rock|dance|club|party/i.test(prompt);
  const isSad = /เหงา|เศร้า|ร้องไห้|sad|alone|อกหัก/i.test(prompt);
  const isLove = /รัก|คลั่งรัก|แฟน|love|romantic/i.test(prompt);
  const isFocus = /สมาธิ|อ่านหนังสือ|focus|study|instrumental/i.test(prompt);
  const isHome = /บ้าน|อยากกลับบ้าน|home|nostalgia/i.test(prompt);

  let targetFeatures: AudioFeatures = {
    danceability: 0.65,
    valence: 0.60,
    energy: 0.55,
    acousticness: 0.45,
    instrumentalness: 0.25,
    liveness: 0.30,
    speechiness: 0.08,
  };

  type SongSeed = {
    title: string;
    artist: string;
    album: string;
    cover: string;
    durationMs: number;
    spotifyUrl: string;
    features: AudioFeatures;
  };

  let songCatalog: SongSeed[] = [];

  if (isSad) {
    targetFeatures = {
      danceability: 0.35,
      valence: 0.22,
      energy: 0.30,
      acousticness: 0.82,
      instrumentalness: 0.25,
      liveness: 0.28,
      speechiness: 0.06,
    };
    songCatalog = [
      {
        title: 'Glimpse of Us',
        artist: 'Joji',
        album: 'SMITHEREENS',
        cover: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=120',
        durationMs: 233000,
        spotifyUrl: 'https://open.spotify.com/track/2pNHFCEbpbLhJCmPkbqCHc',
        features: { danceability: 0.34, valence: 0.20, energy: 0.28, acousticness: 0.85, instrumentalness: 0.22, liveness: 0.25, speechiness: 0.05 },
      },
      {
        title: 'Heather',
        artist: 'Conan Gray',
        album: 'Kid Krow',
        cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=120',
        durationMs: 198000,
        spotifyUrl: 'https://open.spotify.com/track/4xqrdfXkTW4T0RauPLv3WA',
        features: { danceability: 0.36, valence: 0.24, energy: 0.32, acousticness: 0.80, instrumentalness: 0.20, liveness: 0.26, speechiness: 0.06 },
      },
      {
        title: 'Someone You Loved',
        artist: 'Lewis Capaldi',
        album: 'Divinely Uninspired',
        cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=120',
        durationMs: 221000,
        spotifyUrl: 'https://open.spotify.com/track/7qEHsqek33rTcFNT9PFqLf',
        features: { danceability: 0.38, valence: 0.26, energy: 0.38, acousticness: 0.75, instrumentalness: 0.15, liveness: 0.28, speechiness: 0.07 },
      },
      {
        title: 'drivers license',
        artist: 'Olivia Rodrigo',
        album: 'SOUR',
        cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=120',
        durationMs: 242000,
        spotifyUrl: 'https://open.spotify.com/track/5wANPM4fQCJwkGd4rN57mH',
        features: { danceability: 0.35, valence: 0.21, energy: 0.40, acousticness: 0.72, instrumentalness: 0.18, liveness: 0.30, speechiness: 0.06 },
      },
      {
        title: 'ถ้าเธอรักฉันจริง',
        artist: 'Three Man Down',
        album: 'This City Won\'t Be Lonely',
        cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=120',
        durationMs: 256000,
        spotifyUrl: 'https://open.spotify.com/track/5kDMXHPY1ZnKMBzFAr4RiK',
        features: { danceability: 0.37, valence: 0.25, energy: 0.36, acousticness: 0.78, instrumentalness: 0.20, liveness: 0.25, speechiness: 0.05 },
      },
      {
        title: 'Fix You',
        artist: 'Coldplay',
        album: 'X&Y',
        cover: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=120',
        durationMs: 295000,
        spotifyUrl: 'https://open.spotify.com/track/7LVHVU3tWfcxj5aiPFEW4Q',
        features: { danceability: 0.30, valence: 0.19, energy: 0.35, acousticness: 0.84, instrumentalness: 0.30, liveness: 0.22, speechiness: 0.05 },
      },
      {
        title: 'โต๊ะริม (melt)',
        artist: 'NONT TANONT',
        album: 'Cigarette Candy & Vanilla Sky',
        cover: 'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=120',
        durationMs: 218000,
        spotifyUrl: 'https://open.spotify.com/track/3fcte2GVCzvFMsB17AKMSN',
        features: { danceability: 0.40, valence: 0.27, energy: 0.34, acousticness: 0.74, instrumentalness: 0.16, liveness: 0.27, speechiness: 0.06 },
      },
    ];
  } else if (isHighEnergy) {
    targetFeatures = {
      danceability: 0.88,
      valence: 0.85,
      energy: 0.94,
      acousticness: 0.10,
      instrumentalness: 0.15,
      liveness: 0.38,
      speechiness: 0.12,
    };
    songCatalog = [
      {
        title: 'Blinding Lights',
        artist: 'The Weeknd',
        album: 'After Hours',
        cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=120',
        durationMs: 200000,
        spotifyUrl: 'https://open.spotify.com/track/0VjIjW4GlUZAMYd2vXMi3b',
        features: { danceability: 0.86, valence: 0.84, energy: 0.92, acousticness: 0.11, instrumentalness: 0.14, liveness: 0.35, speechiness: 0.10 },
      },
      {
        title: 'Titanium',
        artist: 'David Guetta ft. Sia',
        album: 'Nothing but the Beat',
        cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=120',
        durationMs: 245000,
        spotifyUrl: 'https://open.spotify.com/track/0yLdNVWF3Srea0uzk55zFn',
        features: { danceability: 0.82, valence: 0.80, energy: 0.95, acousticness: 0.08, instrumentalness: 0.18, liveness: 0.40, speechiness: 0.11 },
      },
      {
        title: 'Can\'t Hold Us',
        artist: 'Macklemore & Ryan Lewis',
        album: 'The Heist',
        cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=120',
        durationMs: 257000,
        spotifyUrl: 'https://open.spotify.com/track/3bidbhpOYeV8SoJLdo7d2X',
        features: { danceability: 0.90, valence: 0.88, energy: 0.96, acousticness: 0.09, instrumentalness: 0.12, liveness: 0.42, speechiness: 0.14 },
      },
      {
        title: 'ทรงอย่างแบด (Bad Boy)',
        artist: 'Paper Planes',
        album: 'Bad Boy Single',
        cover: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=120',
        durationMs: 218000,
        spotifyUrl: 'https://open.spotify.com/track/5kDMXHPY1ZnKMBzFAr4RiK',
        features: { danceability: 0.84, valence: 0.82, energy: 0.98, acousticness: 0.06, instrumentalness: 0.10, liveness: 0.39, speechiness: 0.13 },
      },
      {
        title: 'Levitating',
        artist: 'Dua Lipa',
        album: 'Future Nostalgia',
        cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=120',
        durationMs: 203000,
        spotifyUrl: 'https://open.spotify.com/track/39LLxExYz6ewLAcYrzQQyP',
        features: { danceability: 0.89, valence: 0.90, energy: 0.90, acousticness: 0.08, instrumentalness: 0.12, liveness: 0.36, speechiness: 0.11 },
      },
      {
        title: 'Starboy',
        artist: 'The Weeknd ft. Daft Punk',
        album: 'Starboy',
        cover: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=120',
        durationMs: 230000,
        spotifyUrl: 'https://open.spotify.com/track/5aAx2yezTd8zXrkmtKl66Z',
        features: { danceability: 0.87, valence: 0.83, energy: 0.91, acousticness: 0.12, instrumentalness: 0.15, liveness: 0.34, speechiness: 0.10 },
      },
    ];
  } else if (isLove) {
    targetFeatures = {
      danceability: 0.72,
      valence: 0.88,
      energy: 0.62,
      acousticness: 0.55,
      instrumentalness: 0.12,
      liveness: 0.28,
      speechiness: 0.07,
    };
    songCatalog = [
      {
        title: 'Until I Found You',
        artist: 'Stephen Sanchez',
        album: 'Easy on My Eyes',
        cover: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=120',
        durationMs: 173000,
        spotifyUrl: 'https://open.spotify.com/track/0nrRP00O4VFnEzBGFSlp5A',
        features: { danceability: 0.68, valence: 0.85, energy: 0.58, acousticness: 0.62, instrumentalness: 0.10, liveness: 0.26, speechiness: 0.06 },
      },
      {
        title: 'Golden Hour',
        artist: 'JVKE',
        album: 'this is what ____ feels like',
        cover: 'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=120',
        durationMs: 209000,
        spotifyUrl: 'https://open.spotify.com/track/5odlY52u43F5BjByhxg7wg',
        features: { danceability: 0.70, valence: 0.88, energy: 0.64, acousticness: 0.52, instrumentalness: 0.14, liveness: 0.27, speechiness: 0.07 },
      },
      {
        title: 'Lover',
        artist: 'Taylor Swift',
        album: 'Lover',
        cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=120',
        durationMs: 221000,
        spotifyUrl: 'https://open.spotify.com/track/1dGr1c8CrMLDpV6mPbImSI',
        features: { danceability: 0.74, valence: 0.90, energy: 0.60, acousticness: 0.58, instrumentalness: 0.11, liveness: 0.25, speechiness: 0.06 },
      },
      {
        title: 'พิง (เพลงประกอบละคร กระเช้าสีดา)',
        artist: 'NONT TANONT',
        album: 'พิง Single',
        cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=120',
        durationMs: 235000,
        spotifyUrl: 'https://open.spotify.com/track/3fcte2GVCzvFMsB17AKMSN',
        features: { danceability: 0.69, valence: 0.82, energy: 0.61, acousticness: 0.59, instrumentalness: 0.13, liveness: 0.29, speechiness: 0.07 },
      },
      {
        title: 'I Like You (A Happier Song)',
        artist: 'Post Malone ft. Doja Cat',
        album: 'Twelve Carat Toothache',
        cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=120',
        durationMs: 198000,
        spotifyUrl: 'https://open.spotify.com/track/3HWBw4h5XBzHTUQJIiJHU3',
        features: { danceability: 0.76, valence: 0.91, energy: 0.66, acousticness: 0.48, instrumentalness: 0.12, liveness: 0.30, speechiness: 0.08 },
      },
    ];
  } else if (isFocus) {
    targetFeatures = {
      danceability: 0.45,
      valence: 0.48,
      energy: 0.38,
      acousticness: 0.78,
      instrumentalness: 0.94,
      liveness: 0.20,
      speechiness: 0.04,
    };
    songCatalog = [
      {
        title: 'Weightless',
        artist: 'Marconi Union',
        album: 'Weightless (Ambient)',
        cover: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=120',
        durationMs: 480000,
        spotifyUrl: 'https://open.spotify.com/track/7ygpwy2qP3NbrxVkHvUhXY',
        features: { danceability: 0.42, valence: 0.45, energy: 0.32, acousticness: 0.82, instrumentalness: 0.96, liveness: 0.18, speechiness: 0.03 },
      },
      {
        title: 'Experience',
        artist: 'Ludovico Einaudi',
        album: 'In a Time Lapse',
        cover: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=120',
        durationMs: 348000,
        spotifyUrl: 'https://open.spotify.com/track/1BNC8I3tKCyd3gJMB0OUkX',
        features: { danceability: 0.46, valence: 0.50, energy: 0.45, acousticness: 0.74, instrumentalness: 0.93, liveness: 0.22, speechiness: 0.04 },
      },
      {
        title: 'Cornfield Chase',
        artist: 'Hans Zimmer',
        album: 'Interstellar Soundtrack',
        cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=120',
        durationMs: 148000,
        spotifyUrl: 'https://open.spotify.com/track/2igwFfmr1UkRBe8YEpFMTO',
        features: { danceability: 0.43, valence: 0.47, energy: 0.42, acousticness: 0.72, instrumentalness: 0.95, liveness: 0.21, speechiness: 0.04 },
      },
      {
        title: 'Clair de Lune',
        artist: 'Claude Debussy',
        album: 'Suite bergamasque',
        cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=120',
        durationMs: 292000,
        spotifyUrl: 'https://open.spotify.com/track/2RlgNHKcydI9sayD2Df2xp',
        features: { danceability: 0.40, valence: 0.44, energy: 0.28, acousticness: 0.88, instrumentalness: 0.98, liveness: 0.19, speechiness: 0.03 },
      },
      {
        title: 'Nuages',
        artist: 'Django Reinhardt',
        album: 'Djangology',
        cover: 'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=120',
        durationMs: 198000,
        spotifyUrl: 'https://open.spotify.com/track/4Bp7cFVRgRBBiEuRW8BQXF',
        features: { danceability: 0.48, valence: 0.52, energy: 0.36, acousticness: 0.80, instrumentalness: 0.92, liveness: 0.23, speechiness: 0.04 },
      },
    ];
  } else if (isHome) {
    targetFeatures = {
      danceability: 0.60,
      valence: 0.68,
      energy: 0.56,
      acousticness: 0.68,
      instrumentalness: 0.15,
      liveness: 0.32,
      speechiness: 0.06,
    };
    songCatalog = [
      {
        title: 'Take Me Home, Country Roads',
        artist: 'John Denver',
        album: 'Poems, Prayers & Promises',
        cover: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=120',
        durationMs: 191000,
        spotifyUrl: 'https://open.spotify.com/track/1PgCNKbMvMUWjr5t5L1K9m',
        features: { danceability: 0.62, valence: 0.70, energy: 0.58, acousticness: 0.65, instrumentalness: 0.12, liveness: 0.30, speechiness: 0.06 },
      },
      {
        title: 'คิดถึงบ้าน',
        artist: 'พงษ์สิทธิ์ คำภีร์',
        album: 'เสือตัวที่ 11',
        cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=120',
        durationMs: 248000,
        spotifyUrl: 'https://open.spotify.com/track/2J4EWgFatFYiuFXRRLVhMN',
        features: { danceability: 0.58, valence: 0.64, energy: 0.52, acousticness: 0.72, instrumentalness: 0.14, liveness: 0.31, speechiness: 0.05 },
      },
      {
        title: 'Castle on the Hill',
        artist: 'Ed Sheeran',
        album: '÷ (Divide)',
        cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=120',
        durationMs: 261000,
        spotifyUrl: 'https://open.spotify.com/track/6wafZDQHSKNAPXEMaEiDXY',
        features: { danceability: 0.64, valence: 0.72, energy: 0.65, acousticness: 0.60, instrumentalness: 0.10, liveness: 0.34, speechiness: 0.07 },
      },
      {
        title: 'กลับบ้าน',
        artist: 'TaitosmitH',
        album: 'เพื่อชีวิตกู',
        cover: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=120',
        durationMs: 232000,
        spotifyUrl: 'https://open.spotify.com/track/7LfaNmPIfGrB4EzfHUbLVY',
        features: { danceability: 0.59, valence: 0.66, energy: 0.60, acousticness: 0.66, instrumentalness: 0.16, liveness: 0.32, speechiness: 0.06 },
      },
    ];
  } else {
    // Default Chill Lofi
    targetFeatures = {
      danceability: 0.68,
      valence: 0.64,
      energy: 0.50,
      acousticness: 0.65,
      instrumentalness: 0.55,
      liveness: 0.28,
      speechiness: 0.06,
    };
    songCatalog = [
      {
        title: 'Sunflower',
        artist: 'Post Malone & Swae Lee',
        album: 'Spider-Man Soundtrack',
        cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=120',
        durationMs: 158000,
        spotifyUrl: 'https://open.spotify.com/track/3KkXRkHbMCARz0aVfEt68P',
        features: { danceability: 0.72, valence: 0.68, energy: 0.52, acousticness: 0.58, instrumentalness: 0.45, liveness: 0.26, speechiness: 0.06 },
      },
      {
        title: 'Sunday Morning',
        artist: 'Maroon 5',
        album: 'Songs About Jane',
        cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=120',
        durationMs: 242000,
        spotifyUrl: 'https://open.spotify.com/track/3hRV0jL3vUpRrcy398teAU',
        features: { danceability: 0.66, valence: 0.70, energy: 0.48, acousticness: 0.60, instrumentalness: 0.50, liveness: 0.28, speechiness: 0.05 },
      },
      {
        title: 'ใจเย็นๆ',
        artist: 'คณะขวัญใจ',
        album: 'คณะขวัญใจ',
        cover: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=120',
        durationMs: 225000,
        spotifyUrl: 'https://open.spotify.com/track/3fcte2GVCzvFMsB17AKMSN',
        features: { danceability: 0.64, valence: 0.62, energy: 0.46, acousticness: 0.70, instrumentalness: 0.58, liveness: 0.27, speechiness: 0.05 },
      },
      {
        title: 'Coffee',
        artist: 'beabadoobee',
        album: 'Patched Up',
        cover: 'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=120',
        durationMs: 141000,
        spotifyUrl: 'https://open.spotify.com/track/3PfIrDoz19wz7qK7tYeu62',
        features: { danceability: 0.62, valence: 0.60, energy: 0.42, acousticness: 0.75, instrumentalness: 0.62, liveness: 0.24, speechiness: 0.05 },
      },
      {
        title: 'Banana Pancakes',
        artist: 'Jack Johnson',
        album: 'In Between Dreams',
        cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=120',
        durationMs: 193000,
        spotifyUrl: 'https://open.spotify.com/track/2FLMq3aVqPTmNLMWyDdVHA',
        features: { danceability: 0.67, valence: 0.72, energy: 0.47, acousticness: 0.66, instrumentalness: 0.48, liveness: 0.29, speechiness: 0.06 },
      },
    ];
  }

  // Calculate Cosine Similarity Match Score for each track
  const tracks: Track[] = songCatalog.map((song, idx) => {
    // calculate distance
    const diff =
      Math.abs(song.features.danceability - targetFeatures.danceability) +
      Math.abs(song.features.valence - targetFeatures.valence) +
      Math.abs(song.features.energy - targetFeatures.energy) +
      Math.abs(song.features.acousticness - targetFeatures.acousticness);

    const matchScore = Math.max(89, Math.min(99, Math.round(99 - diff * 8)));

    return {
      id: `ai-rec-${idx + 1}-${Date.now()}`,
      title: song.title,
      artistName: song.artist,
      albumName: song.album,
      albumCoverUrl: song.cover,
      durationMs: song.durationMs,
      spotifyUrl: song.spotifyUrl,
      audioFeatures: song.features,
      matchScore,
    };
  });

  return { tracks, targetFeatures };
}

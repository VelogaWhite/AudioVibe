import { Page } from '@playwright/test';

export interface MockAudioFeatures {
  danceability: number;
  valence: number;
  energy: number;
  acousticness: number;
  instrumentalness: number;
  liveness: number;
  speechiness: number;
}

export interface MockTrack {
  id: string;
  title: string;
  artistName: string;
  albumName?: string;
  albumCoverUrl?: string;
  durationMs: number;
  popularity: number;
  audioFeatures?: MockAudioFeatures;
  matchScore?: number;
}

export interface MockPlaylist {
  id: string;
  name: string;
  isPublic: boolean;
  isExported: boolean;
  spotifyPlaylistId?: string | null;
  tracks: MockTrack[];
}

export const DEMO_USER = {
  id: 'demo-user-001',
  displayName: 'AudioVibe QA Tester',
  spotifyId: 'audiovibe_qa_se',
  profileImageUrl: 'https://i.scdn.co/image/ab6761610000e5eb55d39ab9c21d506aa52f7021',
};

export const AI_RECOMMENDED_TRACKS: Array<{
  track_id: string;
  title: string;
  artist_name: string;
  album_name: string;
  similarity_score: number;
  audio_features: MockAudioFeatures;
}> = [
  {
    track_id: '2plbrEY59IikOBgBGLjaoe',
    title: 'Die With A Smile',
    artist_name: 'Lady Gaga, Bruno Mars',
    album_name: 'Die With A Smile',
    similarity_score: 0.98,
    audio_features: { danceability: 0.521, valence: 0.535, energy: 0.592, acousticness: 0.308, instrumentalness: 0.0, liveness: 0.122, speechiness: 0.0304 },
  },
  {
    track_id: '6dOtVTDdiauQNBQEDOtlAB',
    title: 'BIRDS OF A FEATHER',
    artist_name: 'Billie Eilish',
    album_name: 'HIT ME HARD AND SOFT',
    similarity_score: 0.96,
    audio_features: { danceability: 0.747, valence: 0.438, energy: 0.507, acousticness: 0.2, instrumentalness: 0.0608, liveness: 0.117, speechiness: 0.0358 },
  },
  {
    track_id: '7ne4VBA60CxGM75vw0EYad',
    title: 'That’s So True',
    artist_name: 'Gracie Abrams',
    album_name: 'The Secret of Us (Deluxe)',
    similarity_score: 0.95,
    audio_features: { danceability: 0.554, valence: 0.372, energy: 0.808, acousticness: 0.214, instrumentalness: 0.0, liveness: 0.159, speechiness: 0.0368 },
  },
  {
    track_id: '1d7Ptw3qYcfpdLNL5REhtJ',
    title: 'Taste',
    artist_name: 'Sabrina Carpenter',
    album_name: "Short n' Sweet",
    similarity_score: 0.94,
    audio_features: { danceability: 0.67, valence: 0.786, energy: 0.91, acousticness: 0.0939, instrumentalness: 0.0, liveness: 0.304, speechiness: 0.0634 },
  },
  {
    track_id: '5vNRhkKd0yEAg8suGBpjeY',
    title: 'APT.',
    artist_name: 'ROSÉ, Bruno Mars',
    album_name: 'APT.',
    similarity_score: 0.93,
    audio_features: { danceability: 0.777, valence: 0.939, energy: 0.783, acousticness: 0.0283, instrumentalness: 0.0, liveness: 0.355, speechiness: 0.26 },
  },
  {
    track_id: '0WbMK4wrZ1wFSty9F7FCgu',
    title: 'Good Luck, Babe!',
    artist_name: 'Chappell Roan',
    album_name: 'Good Luck, Babe!',
    similarity_score: 0.92,
    audio_features: { danceability: 0.7, valence: 0.785, energy: 0.582, acousticness: 0.0502, instrumentalness: 0.0, liveness: 0.0881, speechiness: 0.0356 },
  },
  {
    track_id: '6MzofobZt2dm0Kf1hTThFz',
    title: 'Diet Pepsi',
    artist_name: 'Addison Rae',
    album_name: 'Diet Pepsi',
    similarity_score: 0.91,
    audio_features: { danceability: 0.669, valence: 0.841, energy: 0.561, acousticness: 0.495, instrumentalness: 0.00962, liveness: 0.0954, speechiness: 0.0411 },
  },
  {
    track_id: '3QaPy1KgI7nu9FJEQUgn6h',
    title: 'WILDFLOWER',
    artist_name: 'Billie Eilish',
    album_name: 'HIT ME HARD AND SOFT',
    similarity_score: 0.90,
    audio_features: { danceability: 0.467, valence: 0.126, energy: 0.247, acousticness: 0.612, instrumentalness: 0.000271, liveness: 0.17, speechiness: 0.0431 },
  },
  {
    track_id: '0UYnhUfnUj5adChuAXvLUB',
    title: 'Sailor Song',
    artist_name: 'Gigi Perez',
    album_name: 'Sailor Song',
    similarity_score: 0.89,
    audio_features: { danceability: 0.492, valence: 0.297, energy: 0.416, acousticness: 0.686, instrumentalness: 0.0000861, liveness: 0.203, speechiness: 0.0254 },
  },
  {
    track_id: '1Es7AUAhQvapIcoh3qMKDL',
    title: 'Timeless (with Playboi Carti)',
    artist_name: 'The Weeknd, Playboi Carti',
    album_name: 'Timeless',
    similarity_score: 0.88,
    audio_features: { danceability: 0.769, valence: 0.57, energy: 0.722, acousticness: 0.0584, instrumentalness: 0.00000256, liveness: 0.111, speechiness: 0.0507 },
  },
  {
    track_id: '3WOhcATHxK2SLNeP5W3v1v',
    title: 'Guess featuring billie eilish',
    artist_name: 'Charli xcx, Billie Eilish',
    album_name: 'Guess featuring Billie Eilish',
    similarity_score: 0.87,
    audio_features: { danceability: 0.776, valence: 0.618, energy: 0.667, acousticness: 0.0146, instrumentalness: 0.3, liveness: 0.0761, speechiness: 0.0983 },
  },
  {
    track_id: '5N3hjp1WNayUPZrA8kJmJP',
    title: 'Please Please Please',
    artist_name: 'Sabrina Carpenter',
    album_name: 'Please Please Please',
    similarity_score: 0.86,
    audio_features: { danceability: 0.669, valence: 0.579, energy: 0.586, acousticness: 0.274, instrumentalness: 0.0, liveness: 0.104, speechiness: 0.054 },
  },
  {
    track_id: '1f18HzFpegqvH4ibGJyeMJ',
    title: '2 hands',
    artist_name: 'Tate McRae',
    album_name: '2 hands',
    similarity_score: 0.85,
    audio_features: { danceability: 0.608, valence: 0.587, energy: 0.806, acousticness: 0.121, instrumentalness: 0.0, liveness: 0.191, speechiness: 0.0486 },
  },
  {
    track_id: '2FQrifJ1N335Ljm3TjTVVf',
    title: 'A Bar Song (Tipsy)',
    artist_name: 'Shaboozey',
    album_name: 'A Bar Song (Tipsy)',
    similarity_score: 0.84,
    audio_features: { danceability: 0.722, valence: 0.604, energy: 0.709, acousticness: 0.0633, instrumentalness: 0.0, liveness: 0.0804, speechiness: 0.0273 },
  },
  {
    track_id: '4xdBrk0nFZaP54vvZj0yx7',
    title: 'HOT TO GO!',
    artist_name: 'Chappell Roan',
    album_name: 'The Rise and Fall of a Midwest Princess',
    similarity_score: 0.83,
    audio_features: { danceability: 0.742, valence: 0.957, energy: 0.757, acousticness: 0.0187, instrumentalness: 0.0, liveness: 0.305, speechiness: 0.0421 },
  },
];

export const SEARCH_MOCK_RESULTS: MockTrack[] = [
  {
    id: '0VjIjW4GlUZAMYd2vXMi3b',
    title: 'Blinding Lights',
    artistName: 'The Weeknd',
    albumName: 'After Hours',
    durationMs: 200040,
    popularity: 95,
  },
  {
    id: '7qiZfU4dY1lWllzX7mPBI3',
    title: 'Shape of You',
    artistName: 'Ed Sheeran',
    albumName: '÷ (Divide)',
    durationMs: 233713,
    popularity: 92,
  },
];

export async function setupStudioApiMocks(
  page: Page,
  initialPlaylists: MockPlaylist[] = [
    {
      id: 'pl-starter-01',
      name: 'My Starter Vibes',
      isPublic: true,
      isExported: false,
      spotifyPlaylistId: null,
      tracks: [
        {
          id: '2plbrEY59IikOBgBGLjaoe',
          title: 'Die With A Smile',
          artistName: 'Lady Gaga, Bruno Mars',
          albumName: 'Die With A Smile',
          durationMs: 251668,
          popularity: 100,
          audioFeatures: AI_RECOMMENDED_TRACKS[0].audio_features,
          matchScore: 98,
        },
        {
          id: '6dOtVTDdiauQNBQEDOtlAB',
          title: 'BIRDS OF A FEATHER',
          artistName: 'Billie Eilish',
          albumName: 'HIT ME HARD AND SOFT',
          durationMs: 210373,
          popularity: 97,
          audioFeatures: AI_RECOMMENDED_TRACKS[1].audio_features,
          matchScore: 96,
        },
      ],
    },
  ],
) {
  let playlists: MockPlaylist[] = JSON.parse(JSON.stringify(initialPlaylists));
  let playlistCounter = playlists.length + 1;

  // 1. User Profile endpoint
  await page.route('**/users/*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(DEMO_USER),
    });
  });

  // 2. ML Service Recommendation endpoint
  await page.route('**/api/v1/recommend', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        target_vector: {
          danceability: 0.72,
          valence: 0.65,
          energy: 0.78,
          acousticness: 0.25,
          instrumentalness: 0.12,
          liveness: 0.18,
          speechiness: 0.08,
        },
        tracks: AI_RECOMMENDED_TRACKS,
      }),
    });
  });

  // 3. Core API Playlists & Search endpoints
  await page.route('**/playlists**', async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    const method = req.method();
    const path = url.pathname;

    // GET /playlists/search
    if (method === 'GET' && path.endsWith('/playlists/search')) {
      const q = (url.searchParams.get('query') || '').toLowerCase();
      const filtered = SEARCH_MOCK_RESULTS.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.artistName.toLowerCase().includes(q) ||
          q.length > 0,
      );
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(filtered),
      });
      return;
    }

    // POST /playlists/export
    if (method === 'POST' && path.endsWith('/playlists/export')) {
      const body = req.postDataJSON() as { playlistId: string };
      const spotifyId = '37i9dQZF1DXcBWIGoYBM5M';
      playlists = playlists.map((p) =>
        p.id === body.playlistId
          ? { ...p, isExported: true, spotifyPlaylistId: spotifyId }
          : p,
      );
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          playlistId: body.playlistId,
          spotifyPlaylistId: spotifyId,
        }),
      });
      return;
    }

    // GET /playlists?userId=...
    if (method === 'GET' && path === '/playlists') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(playlists),
      });
      return;
    }

    // POST /playlists (Create playlist)
    if (method === 'POST' && path === '/playlists') {
      const body = req.postDataJSON() as { name: string; isPublic?: boolean };
      const newPlaylist: MockPlaylist = {
        id: `pl-created-${playlistCounter++}`,
        name: body.name,
        isPublic: body.isPublic ?? true,
        isExported: false,
        spotifyPlaylistId: null,
        tracks: [],
      };
      playlists = [newPlaylist, ...playlists];
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(newPlaylist),
      });
      return;
    }

    // POST /playlists/:id/tracks (Add tracks to playlist)
    const addTracksMatch = path.match(/^\/playlists\/([^/]+)\/tracks$/);
    if (method === 'POST' && addTracksMatch) {
      const playlistId = addTracksMatch[1];
      const body = req.postDataJSON() as { tracks: MockTrack[] };
      const target = playlists.find((p) => p.id === playlistId);
      if (target) {
        const existingIds = new Set(target.tracks.map((t) => t.id));
        const toAdd = (body.tracks || []).filter((t) => !existingIds.has(t.id));
        target.tracks = [...target.tracks, ...toAdd];
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(target || playlists[0]),
      });
      return;
    }

    // PATCH /playlists/:id/tracks/order (Reorder tracks)
    const reorderMatch = path.match(/^\/playlists\/([^/]+)\/tracks\/order$/);
    if (method === 'PATCH' && reorderMatch) {
      const playlistId = reorderMatch[1];
      const body = req.postDataJSON() as { trackIds: string[] };
      const target = playlists.find((p) => p.id === playlistId);
      if (target && Array.isArray(body.trackIds)) {
        const byId = new Map(target.tracks.map((t) => [t.id, t]));
        target.tracks = body.trackIds
          .map((id) => byId.get(id))
          .filter((t): t is MockTrack => Boolean(t));
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(target || playlists[0]),
      });
      return;
    }

    // DELETE /playlists/:id/tracks/:trackId (Remove track)
    const removeTrackMatch = path.match(/^\/playlists\/([^/]+)\/tracks\/([^/]+)$/);
    if (method === 'DELETE' && removeTrackMatch) {
      const playlistId = removeTrackMatch[1];
      const trackId = decodeURIComponent(removeTrackMatch[2]);
      const target = playlists.find((p) => p.id === playlistId);
      if (target) {
        target.tracks = target.tracks.filter((t) => t.id !== trackId);
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(target || playlists[0]),
      });
      return;
    }

    // PATCH /playlists/:id (Rename playlist)
    const updatePlaylistMatch = path.match(/^\/playlists\/([^/]+)$/);
    if (method === 'PATCH' && updatePlaylistMatch) {
      const playlistId = updatePlaylistMatch[1];
      const body = req.postDataJSON() as { name?: string };
      const target = playlists.find((p) => p.id === playlistId);
      if (target && body.name) {
        target.name = body.name;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(target || playlists[0]),
      });
      return;
    }

    // DELETE /playlists/:id (Delete playlist)
    if (method === 'DELETE' && updatePlaylistMatch) {
      const playlistId = updatePlaylistMatch[1];
      playlists = playlists.filter((p) => p.id !== playlistId);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ deleted: true, playlistId }),
      });
      return;
    }

    await route.continue();
  });
}

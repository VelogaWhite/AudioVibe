import { create } from 'zustand';

export interface AudioFeatures {
  danceability: number;
  valence: number;
  energy: number;
  acousticness: number;
  instrumentalness: number;
  liveness: number;
  speechiness: number;
}

export interface Track {
  id: string;
  title: string;
  artistName: string;
  albumName?: string;
  albumCoverUrl?: string;
  durationMs?: number;
  spotifyUrl?: string;
  audioFeatures?: AudioFeatures;
  matchScore?: number;
}

export interface Playlist {
  id: string;
  name: string;
  isPublic?: boolean;
  isExported?: boolean;
  spotifyPlaylistId?: string | null;
  tracks: Track[];
}

export type DisplayMode = 'AI_ANALYTICS' | 'MANUAL_MANAGER';
export type ThemeVibe = 'NATURE' | 'LOVE' | 'RAINY' | 'FIRE';

interface PlaylistState {
  currentPlaylist: Playlist | null;
  playlists: Playlist[];
  tracks: Track[];
  displayMode: DisplayMode;
  themeVibe: ThemeVibe;
  isLoading: boolean;
  error: string | null;
  exportModalOpen: boolean;
  lastExportedId: string | null;

  // Actions
  setPlaylist: (playlist: Playlist | null) => void;
  setPlaylists: (playlists: Playlist[]) => void;
  setMode: (mode: DisplayMode) => void;
  setThemeVibe: (theme: ThemeVibe) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setExportModalOpen: (open: boolean, spotifyPlaylistId?: string | null) => void;

  addTrack: (track: Track) => void;
  removeTrack: (trackId: string) => void;
  reorderTracks: (startIndex: number, endIndex: number) => void;
}

const initialTracks: Track[] = [
  {
    id: 'track-init-1',
    title: 'Midnight Coffee',
    artistName: 'Lofi Chilled',
    albumName: 'Night Beats Vol. 1',
    albumCoverUrl:
      'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=120',
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
    id: 'track-init-2',
    title: 'Neon Rainy Walk',
    artistName: 'Urban Synth',
    albumName: 'City Lights',
    albumCoverUrl:
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=120',
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
];

const initialPlaylist: Playlist = {
  id: 'my-vibe-playlist',
  name: '🎧 My Focus Beats',
  isPublic: true,
  isExported: false,
  tracks: initialTracks,
};

export const usePlaylistStore = create<PlaylistState>((set) => ({
  currentPlaylist: initialPlaylist,
  playlists: [initialPlaylist],
  tracks: initialTracks,
  displayMode: 'MANUAL_MANAGER',
  themeVibe: 'NATURE',
  isLoading: false,
  error: null,
  exportModalOpen: false,
  lastExportedId: null,

  setPlaylist: (playlist) =>
    set({
      currentPlaylist: playlist,
      tracks: playlist ? playlist.tracks : [],
    }),

  setPlaylists: (playlists) => set({ playlists }),

  setMode: (mode) => set({ displayMode: mode }),

  setThemeVibe: (theme) => set({ themeVibe: theme }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  setExportModalOpen: (open, spotifyPlaylistId = null) =>
    set({ exportModalOpen: open, lastExportedId: spotifyPlaylistId }),

  addTrack: (track) =>
    set((state) => {
      const updatedTracks = [...state.tracks, track];
      const updatedPlaylist = state.currentPlaylist
        ? { ...state.currentPlaylist, tracks: updatedTracks }
        : null;

      return {
        tracks: updatedTracks,
        currentPlaylist: updatedPlaylist,
        displayMode: 'MANUAL_MANAGER', // Hide radar chart when manually adding tracks!
      };
    }),

  removeTrack: (trackId) =>
    set((state) => {
      const updatedTracks = state.tracks.filter((t) => t.id !== trackId);
      const updatedPlaylist = state.currentPlaylist
        ? { ...state.currentPlaylist, tracks: updatedTracks }
        : null;

      return {
        tracks: updatedTracks,
        currentPlaylist: updatedPlaylist,
      };
    }),

  reorderTracks: (startIndex, endIndex) =>
    set((state) => {
      const result = Array.from(state.tracks);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);

      const updatedPlaylist = state.currentPlaylist
        ? { ...state.currentPlaylist, tracks: result }
        : null;

      return {
        tracks: result,
        currentPlaylist: updatedPlaylist,
      };
    }),
}));

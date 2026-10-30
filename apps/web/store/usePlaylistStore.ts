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
  audioFeatures?: AudioFeatures;
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

interface PlaylistState {
  currentPlaylist: Playlist | null;
  playlists: Playlist[];
  tracks: Track[];
  displayMode: DisplayMode;
  isLoading: boolean;
  error: string | null;
  exportModalOpen: boolean;
  lastExportedId: string | null;

  // Actions
  setPlaylist: (playlist: Playlist | null) => void;
  setPlaylists: (playlists: Playlist[]) => void;
  setMode: (mode: DisplayMode) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setExportModalOpen: (open: boolean, spotifyPlaylistId?: string | null) => void;

  addTrack: (track: Track) => void;
  removeTrack: (trackId: string) => void;
  reorderTracks: (startIndex: number, endIndex: number) => void;
}

export const usePlaylistStore = create<PlaylistState>((set) => ({
  currentPlaylist: null,
  playlists: [],
  tracks: [],
  displayMode: 'MANUAL_MANAGER',
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

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  setExportModalOpen: (open, spotifyPlaylistId = null) =>
    set({ exportModalOpen: open, lastExportedId: spotifyPlaylistId }),

  addTrack: (track) =>
    set((state) => {
      // Adding manually switches mode to MANUAL_MANAGER per spec!
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

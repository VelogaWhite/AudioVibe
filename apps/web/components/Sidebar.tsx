'use client';

import React from 'react';
import {
  Plus,
  RefreshCw,
  Edit2,
  Trash2,
  Share2,
  User as UserIcon,
  ListMusic,
  Check,
} from 'lucide-react';
import { usePlaylistStore } from '../store/usePlaylistStore';

interface UserProfile {
  id: string;
  displayName: string;
  spotifyId: string;
  profileImageUrl?: string;
}

interface SidebarProps {
  user: UserProfile | null;
  onCreatePlaylist: () => void;
  onRefreshPlaylists: () => void;
  onRenamePlaylist: () => void;
  onDeletePlaylist: () => void;
  onExportPlaylist: () => void;
  onSelectPlaylist: (id: string) => void;
  isExporting?: boolean;
}

export function Sidebar({
  user,
  onCreatePlaylist,
  onRefreshPlaylists,
  onRenamePlaylist,
  onDeletePlaylist,
  onExportPlaylist,
  onSelectPlaylist,
  isExporting = false,
}: SidebarProps) {
  const { currentPlaylist, playlists, tracks } = usePlaylistStore();

  return (
    <aside className="w-full lg:w-[30%] flex flex-col gap-5">
      {/* User Profile Card */}
      <section className="bg-[#121f18]/90 border border-[#234230] rounded-2xl p-5 shadow-lg backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="w-13 h-13 rounded-full overflow-hidden bg-[#1b3827] border-2 border-[#1ed760] shrink-0">
            {user?.profileImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.profileImageUrl}
                alt={user.displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#558367]">
                <UserIcon className="w-6 h-6" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold text-white truncate">
              {user?.displayName || 'Loading profile...'}
            </h3>
            <p className="text-xs text-[#82a691] truncate font-mono mt-0.5">
              Spotify: {user?.spotifyId || 'unknown'}
            </p>
          </div>
        </div>

        {/* Active Playlist Selector */}
        <div className="mt-5">
          <label
            htmlFor="playlist-select"
            className="block text-xs font-semibold text-[#82a691] uppercase tracking-wider mb-2"
          >
            Active Playlist (เพลย์ลิสต์ที่ใช้งาน)
          </label>
          <div className="relative">
            <select
              id="playlist-select"
              value={currentPlaylist?.id || ''}
              onChange={(e) => onSelectPlaylist(e.target.value)}
              className="w-full bg-[#0b1410] border border-[#2c4d3a] rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#1ed760] transition-colors appearance-none"
            >
              <option value="">-- เลือกเพลย์ลิสต์ --</option>
              {playlists.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.tracks?.length || 0} tracks)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Playlist Controls */}
        <div className="grid grid-cols-2 gap-2 mt-3">
          <button
            onClick={onCreatePlaylist}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#1ed760] hover:bg-[#1db954] text-[#06140a] text-xs font-bold transition-all shadow"
          >
            <Plus className="w-4 h-4" />
            <span>New Playlist</span>
          </button>
          <button
            onClick={onRefreshPlaylists}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#1d3326] hover:bg-[#254232] text-[#c2e2ce] text-xs font-medium transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </section>

      {/* Current Playlist Summary & Actions */}
      <section className="bg-[#121f18]/90 border border-[#234230] rounded-2xl p-5 shadow-lg backdrop-blur flex flex-col gap-4">
        <div className="flex items-center gap-2 pb-2 border-b border-[#1f3a2b]">
          <ListMusic className="w-5 h-5 text-[#1ed760]" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Current Playlist Summary
          </h3>
        </div>

        <div>
          <div className="text-lg font-bold text-white truncate">
            {currentPlaylist?.name || 'ยังไม่ได้เลือกเพลย์ลิสต์'}
          </div>
          <div className="text-xs text-[#82a691] mt-1 flex items-center gap-2">
            <span>{tracks.length} เพลง</span>
            <span>•</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                currentPlaylist?.isExported
                  ? 'bg-[#1b432c] text-[#1ed760]'
                  : 'bg-[#2a291e] text-[#e0b84c]'
              }`}
            >
              {currentPlaylist?.isExported ? '✓ Exported to Spotify' : 'Local Only'}
            </span>
          </div>
        </div>

        {/* Manage Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onRenamePlaylist}
            disabled={!currentPlaylist}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#1a2d21] hover:bg-[#223d2c] border border-[#2a4d38] text-xs text-[#c2e2ce] font-medium transition-all disabled:opacity-40"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Rename</span>
          </button>
          <button
            onClick={onDeletePlaylist}
            disabled={!currentPlaylist}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#2b1717] hover:bg-[#3d1f1f] border border-[#522929] text-xs text-[#ff9999] font-medium transition-all disabled:opacity-40"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>

        {/* Large Call to Action: Export to Spotify */}
        <button
          onClick={onExportPlaylist}
          disabled={!currentPlaylist || tracks.length === 0 || isExporting}
          className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold text-sm bg-[#1ed760] hover:bg-[#1db954] text-[#06140a] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg hover:shadow-[#1ed760]/25 mt-2"
        >
          {isExporting ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : currentPlaylist?.isExported ? (
            <>
              <Check className="w-4 h-4" />
              <span>Sync with Spotify</span>
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4" />
              <span>Export to Spotify</span>
            </>
          )}
        </button>
      </section>
    </aside>
  );
}

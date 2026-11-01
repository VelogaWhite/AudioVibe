'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Share2,
  ListMusic,
  MoreVertical,
  PanelLeftClose,
  PanelLeftOpen,
  Music,
  RefreshCw,
} from 'lucide-react';
import { usePlaylistStore, Playlist } from '../store/usePlaylistStore';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  isNewPlaylistView: boolean;
  onNewPlaylistClick: () => void;
  onSelectPlaylist: (id: string) => void;
  onRenamePlaylist: (playlist?: Playlist) => void;
  onDeletePlaylist: (playlist?: Playlist) => void;
  onExportPlaylist: (playlist?: Playlist) => void;
  onRefreshPlaylists: () => void;
  isExporting?: boolean;
}

export function Sidebar({
  isOpen,
  onToggle,
  isNewPlaylistView,
  onNewPlaylistClick,
  onSelectPlaylist,
  onRenamePlaylist,
  onDeletePlaylist,
  onExportPlaylist,
  onRefreshPlaylists,
  isExporting = false,
}: SidebarProps) {
  const { currentPlaylist, playlists } = usePlaylistStore();
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <aside
      className={`shrink-0 bg-[#0d1913]/95 border-r border-[#1f3a2b] backdrop-blur-md flex flex-col transition-all duration-300 z-30 h-screen sticky top-0 overflow-hidden ${
        isOpen ? 'w-72' : 'w-16'
      }`}
    >
      {/* Top Bar: Brand + Collapse/Expand Button */}
      <div className="flex items-center justify-between p-3.5 border-b border-[#1b3426]">
        {isOpen ? (
          <>
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#1ed760] to-[#0f6832] flex items-center justify-center shadow shadow-[#1ed760]/20 shrink-0">
                <Music className="w-4 h-4 text-[#05160b]" />
              </div>
              <span className="text-base font-extrabold text-white tracking-tight truncate">
                Audio<span className="text-[#1ed760]">Vibe</span>
              </span>
            </div>
            <button
              type="button"
              onClick={onToggle}
              title="ย่อแถบเมนู"
              className="p-2 rounded-xl text-[#82a691] hover:text-white hover:bg-[#182e22] transition-colors"
            >
              <PanelLeftClose className="w-5 h-5" />
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={onToggle}
            title="ขยายแถบเมนู"
            className="w-full flex items-center justify-center p-2 rounded-xl text-[#82a691] hover:text-white hover:bg-[#182e22] transition-colors"
          >
            <PanelLeftOpen className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* New Playlist Button (Gemini "แชทใหม่" style) */}
      <div className="p-3">
        <button
          type="button"
          onClick={() => {
            setOpenMenuId(null);
            onNewPlaylistClick();
          }}
          title="New Playlist"
          className={`w-full flex items-center ${
            isOpen ? 'justify-start gap-3 px-4 py-3' : 'justify-center p-3'
          } rounded-2xl font-bold text-sm transition-all ${
            isNewPlaylistView
              ? 'bg-[#1ed760] text-[#051409] shadow-lg shadow-[#1ed760]/20'
              : 'bg-[#162b20] hover:bg-[#1e3a2b] text-[#d5f2df] border border-[#274b37]'
          }`}
        >
          <Plus className="w-4 h-4 shrink-0" />
          {isOpen && <span className="truncate">New Playlist</span>}
        </button>
      </div>

      {/* Playlist History List (Gemini chat history style) */}
      <div className="flex-1 flex flex-col min-h-0 px-2 pb-4">
        {isOpen && (
          <div className="flex items-center justify-between px-2 py-2 text-[11px] font-semibold text-[#799c87] uppercase tracking-wider">
            <span>เพลย์ลิสต์ทั้งหมด ({playlists.length})</span>
            <button
              type="button"
              onClick={onRefreshPlaylists}
              title="รีเฟรชรายการเพลย์ลิสต์"
              className="p-1 rounded-lg hover:bg-[#182e22] hover:text-white transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div
          ref={menuRef}
          className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar"
        >
          {playlists.length === 0 ? (
            isOpen && (
              <div className="px-3 py-6 text-center text-xs text-[#5e7d6b]">
                ยังไม่มีประวัติเพลย์ลิสต์
              </div>
            )
          ) : (
            playlists.map((playlist) => {
              const isSelected =
                !isNewPlaylistView && currentPlaylist?.id === playlist.id;
              const isMenuOpen = openMenuId === playlist.id;

              return (
                <div key={playlist.id} className="relative group">
                  <div
                    className={`flex items-center ${
                      isOpen ? 'justify-between px-3 py-2.5' : 'justify-center p-2.5'
                    } rounded-xl cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#1b3628] text-white border border-[#2d5940]'
                        : 'text-[#b5d4c1] hover:bg-[#14271d] hover:text-white border border-transparent'
                    }`}
                    onClick={() => {
                      setOpenMenuId(null);
                      onSelectPlaylist(playlist.id);
                    }}
                    title={playlist.name}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <ListMusic
                        className={`w-4 h-4 shrink-0 ${
                          isSelected ? 'text-[#1ed760]' : 'text-[#6c8f79]'
                        }`}
                      />
                      {isOpen && (
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold truncate">
                            {playlist.name}
                          </p>
                          <p className="text-[10px] text-[#6c8f79] truncate">
                            {playlist.tracks?.length || 0} เพลง
                            {playlist.isExported ? ' • Exported' : ''}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Three-dot action button */}
                    {isOpen && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(isMenuOpen ? null : playlist.id);
                        }}
                        aria-label={`ตัวเลือกสำหรับ ${playlist.name}`}
                        className={`p-1.5 rounded-lg transition-colors shrink-0 ${
                          isMenuOpen
                            ? 'bg-[#244734] text-white opacity-100'
                            : 'text-[#7ea08d] hover:bg-[#21402f] hover:text-white opacity-80 group-hover:opacity-100'
                        }`}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Gemini-style Popup Menu for Rename, Delete, Export */}
                  {isOpen && isMenuOpen && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="absolute right-2 top-11 z-50 w-44 rounded-2xl bg-[#15281e] border border-[#2c523c] shadow-2xl py-1.5 text-xs text-[#d8f3e2] animate-in fade-in zoom-in-95 duration-150"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setOpenMenuId(null);
                          onRenamePlaylist(playlist);
                        }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 hover:bg-[#1f3b2c] transition-colors text-left"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-[#8eb09c]" />
                        <span>Rename (เปลี่ยนชื่อ)</span>
                      </button>

                      <button
                        type="button"
                        disabled={isExporting || (playlist.tracks?.length || 0) === 0}
                        onClick={() => {
                          setOpenMenuId(null);
                          onExportPlaylist(playlist);
                        }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 hover:bg-[#1f3b2c] transition-colors text-left disabled:opacity-40"
                      >
                        <Share2 className="w-3.5 h-3.5 text-[#1ed760]" />
                        <span>Export (ส่งออก)</span>
                      </button>

                      <div className="my-1 border-t border-[#234230]" />

                      <button
                        type="button"
                        onClick={() => {
                          setOpenMenuId(null);
                          onDeletePlaylist(playlist);
                        }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 hover:bg-[#331a1a] text-[#ff9999] transition-colors text-left"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete (ลบ)</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </aside>
  );
}

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
  accentColor?: string;
  accentGlow?: string;
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
  accentColor = '#ffffff',
  accentGlow = 'rgba(255, 255, 255, 0.35)',
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
      className={`shrink-0 bg-[#0d0d11]/90 border-r border-white/10 backdrop-blur-xl flex flex-col transition-all duration-300 z-30 h-screen sticky top-0 overflow-hidden ${
        isOpen ? 'w-72' : 'w-16'
      }`}
    >
      {/* Top Bar: Brand (Click to return to AI Chat Prompt) + Collapse/Expand Button */}
      <div className="flex items-center justify-between p-3.5 border-b border-white/10">
        {isOpen ? (
          <>
            <button
              type="button"
              onClick={() => {
                setOpenMenuId(null);
                onNewPlaylistClick();
              }}
              title="กลับไปหน้า AI Chat Prompt"
              className="flex items-center gap-2.5 min-w-0 group cursor-pointer text-left rounded-xl p-1 -ml-1 hover:bg-white/[0.06] transition-colors"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#1ed760] to-[#0f6832] flex items-center justify-center shadow shadow-[#1ed760]/20 shrink-0 group-hover:scale-105 transition-transform">
                <Music className="w-4 h-4 text-[#05160b]" />
              </div>
              <span className="text-base font-extrabold text-white tracking-tight truncate">
                Audio<span className="text-[#1ed760]">Vibe</span>
              </span>
            </button>
            <button
              type="button"
              onClick={onToggle}
              title="ย่อแถบเมนู"
              className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <PanelLeftClose className="w-5 h-5" />
            </button>
          </>
        ) : (
          <div className="w-full flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setOpenMenuId(null);
                onNewPlaylistClick();
              }}
              title="กลับไปหน้า AI Chat Prompt"
              className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#1ed760] to-[#0f6832] flex items-center justify-center shadow shadow-[#1ed760]/20 hover:scale-105 transition-transform cursor-pointer"
            >
              <Music className="w-4 h-4 text-[#05160b]" />
            </button>
            <button
              type="button"
              onClick={onToggle}
              title="ขยายแถบเมนู"
              className="w-full flex items-center justify-center p-1.5 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>
          </div>
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
          style={
            isNewPlaylistView
              ? {
                  backgroundColor: '#ffffff',
                  color: '#0a0a0c',
                  boxShadow: `0 0 22px ${accentGlow}`,
                }
              : {
                  borderColor: `${accentColor}40`,
                  boxShadow: `0 0 14px ${accentGlow}`,
                }
          }
          className={`w-full flex items-center cursor-pointer ${
            isOpen ? 'justify-start gap-3 px-4 py-3' : 'justify-center p-3'
          } rounded-2xl font-bold text-sm transition-all duration-300 ${
            isNewPlaylistView
              ? 'bg-white text-[#0a0a0c]'
              : 'bg-white/[0.06] hover:bg-white/[0.12] text-white border border-white/15'
          }`}
        >
          <Plus className="w-4 h-4 shrink-0" />
          {isOpen && <span className="truncate">New Playlist</span>}
        </button>
      </div>

      {/* Playlist History List (Gemini chat history style) */}
      <div className="flex-1 flex flex-col min-h-0 px-2 pb-4">
        {isOpen && (
          <div className="flex items-center justify-between px-2 py-2 text-[11px] font-semibold text-white/50 uppercase tracking-wider">
            <span>เพลย์ลิสต์ทั้งหมด ({playlists.length})</span>
            <button
              type="button"
              onClick={onRefreshPlaylists}
              title="รีเฟรชรายการเพลย์ลิสต์"
              className="p-1 rounded-lg hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
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
              <div className="px-3 py-6 text-center text-xs text-white/40">
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
                    style={
                      isSelected
                        ? {
                            borderColor: `${accentColor}66`,
                            boxShadow: `0 0 16px ${accentGlow}`,
                            backgroundColor: 'rgba(255, 255, 255, 0.09)',
                          }
                        : undefined
                    }
                    className={`flex items-center ${
                      isOpen ? 'justify-between px-3 py-2.5' : 'justify-center p-2.5'
                    } rounded-xl cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'text-white border'
                        : 'text-white/70 hover:bg-white/[0.06] hover:text-white border border-transparent'
                    }`}
                    onClick={() => {
                      setOpenMenuId(null);
                      onSelectPlaylist(playlist.id);
                    }}
                    title={playlist.name}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <ListMusic
                        style={isSelected ? { color: accentColor } : undefined}
                        className={`w-4 h-4 shrink-0 ${
                          isSelected ? '' : 'text-white/45 group-hover:text-white/80'
                        }`}
                      />
                      {isOpen && (
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold truncate">
                            {playlist.name}
                          </p>
                          <p className="text-[10px] text-white/45 truncate">
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
                        className={`p-1.5 rounded-lg transition-colors shrink-0 cursor-pointer ${
                          isMenuOpen
                            ? 'bg-white/15 text-white opacity-100'
                            : 'text-white/50 hover:bg-white/10 hover:text-white opacity-80 group-hover:opacity-100'
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
                      className="absolute right-2 top-11 z-50 w-44 rounded-2xl bg-[#18181e]/95 backdrop-blur-xl border border-white/15 shadow-2xl py-1.5 text-xs text-white/90 animate-in fade-in zoom-in-95 duration-150"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setOpenMenuId(null);
                          onRenamePlaylist(playlist);
                        }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 hover:bg-white/10 transition-colors text-left cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-white/70" />
                        <span>Rename (เปลี่ยนชื่อ)</span>
                      </button>

                      <button
                        type="button"
                        disabled={isExporting || (playlist.tracks?.length || 0) === 0}
                        onClick={() => {
                          setOpenMenuId(null);
                          onExportPlaylist(playlist);
                        }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 hover:bg-white/10 transition-colors text-left disabled:opacity-40 cursor-pointer"
                      >
                        <Share2 className="w-3.5 h-3.5 text-[#1ed760]" />
                        <span>Export (ส่งออก)</span>
                      </button>

                      <div className="my-1 border-t border-white/10" />

                      <button
                        type="button"
                        onClick={() => {
                          setOpenMenuId(null);
                          onDeletePlaylist(playlist);
                        }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 hover:bg-red-500/15 text-[#ff8a8a] transition-colors text-left cursor-pointer"
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

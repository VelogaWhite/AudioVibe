'use client';

import React, { useState } from 'react';
import { Search, Plus, Music2, Loader2, Check, Clock } from 'lucide-react';
import { Track } from '../store/usePlaylistStore';

interface SearchSpotifyProps {
  onSearch: (query: string) => Promise<Track[]>;
  onAddTrack: (track: Track) => Promise<void>;
  accentColor?: string;
  accentGlow?: string;
}

function formatDuration(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

export function SearchSpotify({
  onSearch,
  onAddTrack,
  accentColor = '#ffffff',
  accentGlow = 'rgba(255, 255, 255, 0.2)',
}: SearchSpotifyProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Track[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isSearching) return;
    setIsSearching(true);
    setHasSearched(true);
    setErrorMessage(null);
    try {
      const tracks = await onSearch(query.trim());
      setResults(tracks);
    } catch (error) {
      setResults([]);
      setErrorMessage(error instanceof Error ? error.message : 'ค้นหาเพลงไม่สำเร็จ');
    } finally {
      setIsSearching(false);
    }
  };

  const handleAdd = async (track: Track) => {
    try {
      await onAddTrack(track);
      setAddedIds((prev) => new Set(prev).add(track.id));
      setTimeout(() => {
        setAddedIds((prev) => {
          const next = new Set(prev);
          next.delete(track.id);
          return next;
        });
      }, 2500);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'เพิ่มเพลงไม่สำเร็จ');
    }
  };

  return (
    <section
      style={{
        borderColor: `${accentColor}38`,
        boxShadow: `0 0 28px ${accentGlow}, 0 8px 30px rgba(0,0,0,0.5)`,
      }}
      className="flex-1 min-h-0 bg-[#121216]/75 border rounded-2xl p-3 backdrop-blur-xl flex flex-col overflow-hidden transition-all duration-500"
    >
      <div className="flex items-center gap-2 mb-1.5 shrink-0">
        <Search
          style={{ color: accentColor }}
          className="w-3.5 h-3.5 transition-colors duration-500"
        />
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">
          Search &amp; Add Tracks
        </h3>
        <span className="text-[10px] px-2 py-0 rounded-full bg-white/[0.08] text-white/75 border border-white/15">
          Manual
        </span>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 mb-2 shrink-0">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ค้นหาชื่อเพลง ศิลปิน หรืออัลบั้ม..."
          className="flex-1 bg-[#0b0b0f]/90 border border-white/15 rounded-xl px-3.5 py-1.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-white/50 focus:ring-1 focus:ring-white/30 transition-all"
        />
        <button
          type="submit"
          disabled={!query.trim() || isSearching}
          style={{
            backgroundColor: accentColor,
            boxShadow: `0 0 18px ${accentGlow}`,
          }}
          className="flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl hover:opacity-90 active:scale-95 text-[#0a0a0c] text-xs font-bold transition-all duration-300 disabled:opacity-40 shrink-0 cursor-pointer"
        >
          {isSearching ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <>
              <Search className="w-3 h-3" />
              <span>ค้นหา</span>
            </>
          )}
        </button>
      </form>

      {errorMessage && (
        <p className="mb-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-[11px] text-red-300 shrink-0">
          {errorMessage}
        </p>
      )}

      {/* Results list (~5 tracks visible) */}
      <div className="flex-1 min-h-0 space-y-1 overflow-y-auto pr-1 custom-scrollbar">
        {results.length > 0 ? (
          results.map((track) => {
            const added = addedIds.has(track.id);
            return (
              <div
                key={track.id}
                style={
                  added
                    ? {
                        borderColor: `${accentColor}60`,
                        backgroundColor: `${accentColor}15`,
                      }
                    : undefined
                }
                className={`flex items-center justify-between py-1.5 px-2.5 rounded-xl border transition-all duration-200
                  ${
                    added
                      ? ''
                      : 'bg-[#0e0e13]/85 border-white/10 hover:border-white/30 hover:bg-white/[0.06]'
                  }`}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded-md overflow-hidden bg-white/[0.06] shrink-0 border border-white/15">
                    {track.albumCoverUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={track.albumCoverUrl}
                        alt={track.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/40">
                        <Music2 className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-white truncate leading-tight">
                      {track.title}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <p className="text-[11px] text-white/60 truncate leading-tight">
                        {track.artistName}
                        {track.albumName ? (
                          <span className="text-white/40"> • {track.albumName}</span>
                        ) : null}
                      </p>
                      {Boolean(track.durationMs && track.durationMs > 0) && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] text-white/45 shrink-0">
                          <Clock className="w-2.5 h-2.5" />
                          {formatDuration(track.durationMs!)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleAdd(track)}
                  disabled={added}
                  style={
                    added
                      ? {
                          color: accentColor,
                          backgroundColor: `${accentColor}20`,
                        }
                      : undefined
                  }
                  className={`flex items-center gap-1 py-1 px-2.5 ml-2 rounded-lg text-[11px] font-semibold transition-all shrink-0 cursor-pointer
                    ${
                      added
                        ? 'cursor-default'
                        : 'bg-white/10 hover:bg-white text-white hover:text-[#0a0a0c] active:scale-95'
                    }`}
                >
                  {added ? (
                    <>
                      <Check className="w-3 h-3" />
                      <span>Added!</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3 h-3" />
                      <span>Add</span>
                    </>
                  )}
                </button>
              </div>
            );
          })
        ) : hasSearched && !isSearching ? (
          <div className="text-center py-4 text-xs text-white/55">
            ไม่พบเพลงที่ตรงกับ &ldquo;{query}&rdquo;
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-xs text-white/40 gap-2">
            <Search className="w-4 h-4 text-white/30" />
            <span>ค้นหาเพลงจาก Spotify เพื่อแอดเข้าเพลย์ลิสต์</span>
          </div>
        )}
      </div>
    </section>
  );
}

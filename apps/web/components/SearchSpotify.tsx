'use client';

import React, { useState } from 'react';
import { Search, Plus, Music2, Loader2, Check, Clock } from 'lucide-react';
import { Track } from '../store/usePlaylistStore';

interface SearchSpotifyProps {
  onSearch: (query: string) => Promise<Track[]>;
  onAddTrack: (track: Track) => void;
}

function formatDuration(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

export function SearchSpotify({ onSearch, onAddTrack }: SearchSpotifyProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Track[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isSearching) return;
    setIsSearching(true);
    setHasSearched(true);
    try {
      const tracks = await onSearch(query.trim());
      setResults(tracks);
    } catch {
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAdd = (track: Track) => {
    onAddTrack(track);
    setAddedIds((prev) => new Set(prev).add(track.id));
    // Reset the tick after 2.5s so user can re-add if needed
    setTimeout(() => {
      setAddedIds((prev) => {
        const next = new Set(prev);
        next.delete(track.id);
        return next;
      });
    }, 2500);
  };

  return (
    <section className="bg-[#121f18]/90 border border-[#234230] rounded-2xl p-5 shadow-lg backdrop-blur">
      <div className="flex items-center gap-2 mb-4">
        <Search className="w-5 h-5 text-[#1ed760]" />
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Search &amp; Add Tracks
        </h3>
        <span className="text-xs px-2 py-0.5 rounded-full bg-[#1b3b29] text-[#82a691] border border-[#234230]">
          Manual
        </span>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ค้นหาชื่อเพลง ศิลปิน หรืออัลบั้ม..."
          className="flex-1 bg-[#0b1410] border border-[#2c4d3a] rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#688a75] focus:outline-none focus:border-[#1ed760] focus:ring-1 focus:ring-[#1ed760]/40 transition-all"
        />
        <button
          type="submit"
          disabled={!query.trim() || isSearching}
          className="flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#1ed760] hover:bg-[#1db954] active:scale-95 text-[#06140a] text-sm font-bold transition-all disabled:opacity-50 shadow-sm"
        >
          {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Search className="w-4 h-4" /><span>ค้นหา</span></>}
        </button>
      </form>

      {/* Results list */}
      <div className="space-y-2 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
        {results.length > 0 ? (
          results.map((track) => {
            const added = addedIds.has(track.id);
            return (
              <div
                key={track.id}
                className={`flex items-center justify-between p-2.5 rounded-xl border transition-all duration-200
                  ${added
                    ? 'bg-[#0d2318] border-[#1ed760]/40'
                    : 'bg-[#0c1611] border-[#1b3426] hover:border-[#2a553c] hover:bg-[#0f1f16]'
                  }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* Album art */}
                  <div className="w-10 h-10 rounded-md overflow-hidden bg-[#182b20] shrink-0 border border-[#244231]">
                    {track.albumCoverUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={track.albumCoverUrl}
                        alt={track.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#406850]">
                        <Music2 className="w-4 h-4" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-white truncate">
                      {track.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <p className="text-xs text-[#7e9f8c] truncate">
                        {track.artistName}
                        {track.albumName ? <span className="text-[#5e7d6b]"> • {track.albumName}</span> : null}
                      </p>
                      {track.durationMs && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] text-[#4f6b5b] shrink-0">
                          <Clock className="w-2.5 h-2.5" />
                          {formatDuration(track.durationMs)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Add button */}
                <button
                  onClick={() => handleAdd(track)}
                  disabled={added}
                  className={`flex items-center gap-1 py-1.5 px-3 ml-2 rounded-lg text-xs font-semibold transition-all shrink-0
                    ${added
                      ? 'bg-[#1b4329] text-[#1ed760] cursor-default'
                      : 'bg-[#193324] hover:bg-[#1ed760] text-[#c2e2ce] hover:text-[#06140a] active:scale-95'
                    }`}
                >
                  {added ? (
                    <><Check className="w-3.5 h-3.5" /><span>Added!</span></>
                  ) : (
                    <><Plus className="w-3.5 h-3.5" /><span>Add</span></>
                  )}
                </button>
              </div>
            );
          })
        ) : hasSearched && !isSearching ? (
          <div className="text-center py-8 text-sm text-[#7e9f8c]">
            <Search className="w-7 h-7 mx-auto mb-2 text-[#3d634d]" />
            ไม่พบเพลงที่ตรงกับ &ldquo;{query}&rdquo;
          </div>
        ) : (
          <div className="text-center py-8 text-xs text-[#4f6b5b] flex flex-col items-center gap-2">
            <Search className="w-7 h-7 text-[#2a4535]" />
            <span>ค้นหาเพลงจาก Spotify เพื่อแอดเข้าเพลย์ลิสต์</span>
          </div>
        )}
      </div>
    </section>
  );
}

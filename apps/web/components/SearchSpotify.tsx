'use client';

import React, { useState } from 'react';
import { Search, Plus, Music2, Loader2 } from 'lucide-react';
import { Track } from '../store/usePlaylistStore';

interface SearchSpotifyProps {
  onSearch: (query: string) => Promise<Track[]>;
  onAddTrack: (track: Track) => void;
}

export function SearchSpotify({ onSearch, onAddTrack }: SearchSpotifyProps) {
  const [query, setQuery] = useState('lofi');
  const [results, setResults] = useState<Track[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

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

  return (
    <section className="bg-[#121f18]/90 border border-[#234230] rounded-2xl p-5 shadow-lg backdrop-blur">
      <div className="flex items-center gap-2 mb-4">
        <Search className="w-5 h-5 text-[#1ed760]" />
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Search Spotify (Manual Add)
        </h3>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ค้นหาชื่อเพลงหรือชื่อศิลปิน..."
          className="flex-1 bg-[#0b1410] border border-[#2c4d3a] rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#688a75] focus:outline-none focus:border-[#1ed760]"
        />
        <button
          type="submit"
          disabled={!query.trim() || isSearching}
          className="flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#1ed760] hover:bg-[#1db954] text-[#06140a] text-sm font-bold transition-all disabled:opacity-50"
        >
          {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
        </button>
      </form>

      {/* Results list */}
      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {results.length > 0 ? (
          results.map((track) => (
            <div
              key={track.id}
              className="flex items-center justify-between p-2.5 rounded-xl bg-[#0c1611] border border-[#1b3426] hover:border-[#2a553c] transition-all"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
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
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white truncate">
                    {track.title}
                  </p>
                  <p className="text-xs text-[#7e9f8c] truncate">
                    {track.artistName} {track.albumName ? `• ${track.albumName}` : ''}
                  </p>
                </div>
              </div>

              <button
                onClick={() => onAddTrack(track)}
                className="flex items-center gap-1 py-1.5 px-3 ml-2 rounded-lg bg-[#193324] hover:bg-[#1ed760] text-[#c2e2ce] hover:text-[#06140a] text-xs font-semibold transition-all shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          ))
        ) : hasSearched && !isSearching ? (
          <div className="text-center py-6 text-sm text-[#7e9f8c]">
            ไม่พบเพลงที่ตรงกับคำค้นหา
          </div>
        ) : (
          <div className="text-center py-6 text-xs text-[#5e7d6b]">
            พิมพ์ค้นหาเพลงสดจาก Spotify เพื่อแอดเข้าเพลย์ลิสต์
          </div>
        )}
      </div>
    </section>
  );
}

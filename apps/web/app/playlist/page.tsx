'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import {
  Music,
  BarChart3,
  ListMusic,
  ArrowLeft,
  User as UserIcon,
  Edit2,
  Trash2,
  Share2,
  RefreshCw,
  Check,
  Sparkles,
} from 'lucide-react';
import {
  usePlaylistStore,
  AudioFeatures,
  Track,
  Playlist,
  ThemeVibe,
} from '../../store/usePlaylistStore';
import { Sidebar } from '../../components/Sidebar';
import { AIPromptBox, PlaylistModifyAction } from '../../components/AIPromptBox';
import { TrackItem } from '../../components/TrackItem';
import { SearchSpotify } from '../../components/SearchSpotify';
import { ExportSuccessModal } from '../../components/ExportSuccessModal';
import {
  fetchUserProfile,
  fetchPlaylists,
  renamePlaylist as apiRenamePlaylist,
  deletePlaylist as apiDeletePlaylist,
  searchSpotifyTracks,
  addTracksToPlaylist,
  removeTrackFromPlaylist,
  reorderPlaylistTracks,
  exportPlaylistToSpotify,
  generateAIRecommendations,
} from '../../lib/api';

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';
}

interface MoodGlowPalette {
  id: string;
  label: string;
  accent: string;
  glow: string;
  strongGlow: string;
  ring4: string;
  ring3: string;
  ring2: string;
  ring1: string;
  radialGradient: string;
}

const MOOD_PALETTES: Record<string, MoodGlowPalette> = {
  RAINY: {
    id: 'RAINY',
    label: '🌧️ Rainy & Melancholy',
    accent: '#38bdf8',
    glow: 'rgba(56, 189, 248, 0.25)',
    strongGlow: 'rgba(56, 189, 248, 0.65)',
    ring4: '#bae6fd',
    ring3: '#7dd3fc',
    ring2: '#38bdf8',
    ring1: '#0284c7',
    radialGradient:
      'radial-gradient(circle at center 800px, rgba(56, 189, 248, 0.65) 0%, rgba(56, 189, 248, 0.3) 14%, rgba(56, 189, 248, 0.14) 18%, rgba(56, 189, 248, 0.06) 22%, rgba(10, 10, 12, 0.2) 25%)',
  },
  FIRE: {
    id: 'FIRE',
    label: '🔥 High Energy & Party',
    accent: '#ff5733',
    glow: 'rgba(255, 87, 51, 0.25)',
    strongGlow: 'rgba(255, 87, 51, 0.65)',
    ring4: '#fed7aa',
    ring3: '#fb923c',
    ring2: '#f97316',
    ring1: '#ea580c',
    radialGradient:
      'radial-gradient(circle at center 800px, rgba(255, 87, 51, 0.65) 0%, rgba(255, 87, 51, 0.3) 14%, rgba(255, 87, 51, 0.14) 18%, rgba(255, 87, 51, 0.06) 22%, rgba(10, 10, 12, 0.2) 25%)',
  },
  LOVE: {
    id: 'LOVE',
    label: '💖 Romantic & Love',
    accent: '#ff4d94',
    glow: 'rgba(255, 77, 148, 0.25)',
    strongGlow: 'rgba(255, 77, 148, 0.65)',
    ring4: '#fbcfe8',
    ring3: '#f472b6',
    ring2: '#ec4899',
    ring1: '#db2777',
    radialGradient:
      'radial-gradient(circle at center 800px, rgba(255, 77, 148, 0.65) 0%, rgba(255, 77, 148, 0.3) 14%, rgba(255, 77, 148, 0.14) 18%, rgba(255, 77, 148, 0.06) 22%, rgba(10, 10, 12, 0.2) 25%)',
  },
  FOCUS: {
    id: 'FOCUS',
    label: '🎯 Deep Focus',
    accent: '#a855f7',
    glow: 'rgba(168, 85, 247, 0.25)',
    strongGlow: 'rgba(168, 85, 247, 0.65)',
    ring4: '#e9d5ff',
    ring3: '#c084fc',
    ring2: '#a855f7',
    ring1: '#7e22ce',
    radialGradient:
      'radial-gradient(circle at center 800px, rgba(168, 85, 247, 0.65) 0%, rgba(168, 85, 247, 0.3) 14%, rgba(168, 85, 247, 0.14) 18%, rgba(168, 85, 247, 0.06) 22%, rgba(10, 10, 12, 0.2) 25%)',
  },
  HOME: {
    id: 'HOME',
    label: '🏡 Warm & Nostalgia',
    accent: '#fbbf24',
    glow: 'rgba(251, 191, 36, 0.24)',
    strongGlow: 'rgba(251, 191, 36, 0.65)',
    ring4: '#fde68a',
    ring3: '#fcd34d',
    ring2: '#fbbf24',
    ring1: '#d97706',
    radialGradient:
      'radial-gradient(circle at center 800px, rgba(251, 191, 36, 0.6) 0%, rgba(251, 191, 36, 0.28) 14%, rgba(251, 191, 36, 0.14) 18%, rgba(251, 191, 36, 0.05) 22%, rgba(10, 10, 12, 0.2) 25%)',
  },
  NATURE: {
    id: 'NATURE',
    label: '🍃 Chill & Relax',
    accent: '#1ed760',
    glow: 'rgba(30, 215, 96, 0.24)',
    strongGlow: 'rgba(30, 215, 96, 0.65)',
    ring4: '#bbf7d0',
    ring3: '#4ade80',
    ring2: '#22c55e',
    ring1: '#15803d',
    radialGradient:
      'radial-gradient(circle at center 800px, rgba(30, 215, 96, 0.6) 0%, rgba(30, 215, 96, 0.28) 14%, rgba(30, 215, 96, 0.14) 18%, rgba(30, 215, 96, 0.05) 22%, rgba(10, 10, 12, 0.2) 25%)',
  },
  WHITE: {
    id: 'WHITE',
    label: '✨ Custom Vibe',
    accent: '#ffffff',
    glow: 'rgba(255, 255, 255, 0.22)',
    strongGlow: 'rgba(255, 255, 255, 0.6)',
    ring4: 'rgba(255, 255, 255, 0.85)',
    ring3: 'rgba(255, 255, 255, 0.6)',
    ring2: 'rgba(255, 255, 255, 0.35)',
    ring1: 'rgba(255, 255, 255, 0.2)',
    radialGradient:
      'radial-gradient(circle at center 800px, rgba(255, 255, 255, 0.55) 0%, rgba(255, 255, 255, 0.25) 14%, rgba(255, 255, 255, 0.12) 18%, rgba(255, 255, 255, 0.05) 22%, rgba(10, 10, 12, 0.2) 25%)',
  },
};

function resolveMoodPalette(
  text: string,
  features?: AudioFeatures | null,
): MoodGlowPalette {
  const combined = text.toLowerCase();

  if (
    /เหงา|เศร้า|ร้องไห้|อกหัก|ฝน|ซึ้ง|rain|sad|alone|lonely|melanchol|blue/i.test(
      combined,
    )
  ) {
    return MOOD_PALETTES.RAINY;
  }
  if (
    /มัน|ตื๊ด|เต้น|ร็อก|ร็อค|rock|metal|punk|dance|club|party|ไฟ|fire|เบสหนัก|สุดเหวี่ยง|hip-hop|hiphop|edm|linkin|queen|nirvana/i.test(
      combined,
    )
  ) {
    return MOOD_PALETTES.FIRE;
  }
  if (
    /คลั่งรัก|เพลงรัก|อินเลิฟ|โรแมนติก|romantic|วาเลนไทน์|\blove\b|หวาน|คู่รัก/i.test(
      combined,
    ) ||
    (/รัก/i.test(combined) && !/น่ารัก|อนุรักษ์/i.test(combined))
  ) {
    return MOOD_PALETTES.LOVE;
  }
  if (
    /สมาธิ|โฟกัส|อ่านหนังสือ|ทำงาน|focus|study|instrumental|ambient|บรรเลง/i.test(
      combined,
    )
  ) {
    return MOOD_PALETTES.FOCUS;
  }
  if (/กลับบ้าน|บ้าน|อบอุ่น|คิดถึง|nostalgia|home|warm|country|folk/i.test(combined)) {
    return MOOD_PALETTES.HOME;
  }
  if (/ผ่อนคลาย|ชิล|สบาย|chill|relax|lofi|lo-fi|acoustic|ธรรมชาติ/i.test(combined)) {
    return MOOD_PALETTES.NATURE;
  }

  // Fallback to 7D audio features if playlist name is generic
  if (features) {
    if (features.energy >= 0.72) return MOOD_PALETTES.FIRE;
    if (features.instrumentalness >= 0.45) return MOOD_PALETTES.FOCUS;
    if (features.valence <= 0.38) return MOOD_PALETTES.RAINY;
    if (features.valence >= 0.68 && features.danceability >= 0.6)
      return MOOD_PALETTES.LOVE;
    if (features.acousticness >= 0.6) return MOOD_PALETTES.NATURE;
  }

  return MOOD_PALETTES.NATURE;
}

// Bolt-style Curved Glowing Horizon Background WITHOUT Vinyl Record (adapts color to playlist mood)
function MoodHorizonBackground({ palette }: { palette: MoodGlowPalette }) {
  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-0">
      <div className="absolute inset-0 bg-[#0a0a0c]" />

      {/* Dynamic Mood Radial Glow */}
      <div
        className="absolute left-1/2 -translate-x-1/2 w-[4000px] h-[1800px] sm:w-[6000px] transition-all duration-700"
        style={{
          background: palette.radialGradient,
        }}
      />

      {/* Glowing Horizon Arc (No Vinyl Image inside) */}
      <div
        className="absolute top-[220px] left-1/2 w-[1600px] h-[1600px] sm:top-[54%] sm:w-[3043px] sm:h-[2865px]"
        style={{ transform: 'translate(-50%) rotate(180deg)' }}
      >
        <div
          className="absolute w-full h-full rounded-full -mt-[13px] transition-all duration-700"
          style={{
            background:
              'radial-gradient(43.89% 25.74% at 50.02% 97.24%, #111115 0%, #0a0a0c 100%)',
            border: '14px solid #ffffff',
            transform: 'rotate(180deg)',
            zIndex: 5,
          }}
        />
        <div
          className="absolute w-full h-full rounded-full bg-[#0a0a0c] -mt-[11px] transition-all duration-700"
          style={{
            border: `23px solid ${palette.ring4}`,
            transform: 'rotate(180deg)',
            zIndex: 4,
          }}
        />
        <div
          className="absolute w-full h-full rounded-full bg-[#0a0a0c] -mt-[8px] transition-all duration-700"
          style={{
            border: `23px solid ${palette.ring3}`,
            transform: 'rotate(180deg)',
            zIndex: 3,
          }}
        />
        <div
          className="absolute w-full h-full rounded-full bg-[#0a0a0c] -mt-[4px] transition-all duration-700"
          style={{
            border: `23px solid ${palette.ring2}`,
            transform: 'rotate(180deg)',
            zIndex: 2,
          }}
        />
        <div
          className="absolute w-full h-full rounded-full bg-[#0a0a0c] transition-all duration-700"
          style={{
            border: `20px solid ${palette.ring1}`,
            boxShadow: `0 -18px 45px ${palette.strongGlow}`,
            transform: 'rotate(180deg)',
            zIndex: 1,
          }}
        />
      </div>
    </div>
  );
}

const AudioRadarChart = dynamic(
  () => import('../../components/RadarChart').then((mod) => mod.AudioRadarChart),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 flex items-center justify-center bg-[#121216]/75 rounded-2xl border border-white/15 text-white/50 text-xs animate-pulse backdrop-blur-xl">
        กำลังโหลดกราฟเรดาร์ 7 มิติเสียง...
      </div>
    ),
  },
);

export default function PlaylistDetailPage() {
  const router = useRouter();
  const {
    currentPlaylist,
    playlists,
    tracks,
    setPlaylist,
    setPlaylists,
    setMode,
    setThemeVibe,
    setExportModalOpen,
  } = usePlaylistStore();

  const [user, setUser] = useState<{
    id: string;
    displayName: string;
    spotifyId: string;
    profileImageUrl?: string;
  }>({
    id: '',
    displayName: 'กำลังโหลด...',
    spotifyId: '',
    profileImageUrl: undefined,
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [aiFeatures, setAiFeatures] = useState<AudioFeatures | null>(null);
  const [lastPromptText, setLastPromptText] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string>('พร้อมใช้งาน');

  const effectiveRadarFeatures = useMemo<AudioFeatures | null>(() => {
    if (aiFeatures) return aiFeatures;
    const tracksWithFeatures = tracks.filter((t) => t.audioFeatures);
    if (tracksWithFeatures.length === 0) return null;
    const count = tracksWithFeatures.length;
    const sum = tracksWithFeatures.reduce(
      (acc, t) => {
        const af = t.audioFeatures!;
        return {
          danceability: acc.danceability + (af.danceability ?? 0.5),
          valence: acc.valence + (af.valence ?? 0.5),
          energy: acc.energy + (af.energy ?? 0.5),
          acousticness: acc.acousticness + (af.acousticness ?? 0.5),
          instrumentalness: acc.instrumentalness + (af.instrumentalness ?? 0),
          liveness: acc.liveness + (af.liveness ?? 0.2),
          speechiness: acc.speechiness + (af.speechiness ?? 0.05),
        };
      },
      {
        danceability: 0,
        valence: 0,
        energy: 0,
        acousticness: 0,
        instrumentalness: 0,
        liveness: 0,
        speechiness: 0,
      },
    );
    return {
      danceability: sum.danceability / count,
      valence: sum.valence / count,
      energy: sum.energy / count,
      acousticness: sum.acousticness / count,
      instrumentalness: sum.instrumentalness / count,
      liveness: sum.liveness / count,
      speechiness: sum.speechiness / count,
    };
  }, [aiFeatures, tracks]);

  // Dynamic Mood Glow Palette resolved from current playlist name, latest prompt, or 7D audio features
  const moodPalette = useMemo<MoodGlowPalette>(() => {
    const sourceText = `${lastPromptText} ${currentPlaylist?.name || ''}`;
    return resolveMoodPalette(sourceText, effectiveRadarFeatures);
  }, [lastPromptText, currentPlaylist?.name, effectiveRadarFeatures]);

  const loadInitialData = useCallback(async () => {
    let activeUserId: string | undefined = undefined;
    let targetPlaylistId: string | undefined = undefined;

    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const paramUserId = urlParams.get('userId');
      const paramPlaylistId = urlParams.get('playlistId');

      if (paramUserId) {
        activeUserId = paramUserId;
        localStorage.setItem('audiovibe_user_id', paramUserId);
      } else {
        const storedId = localStorage.getItem('audiovibe_user_id');
        if (storedId) activeUserId = storedId;
      }

      if (paramPlaylistId) {
        targetPlaylistId = paramPlaylistId;
      }
    }

    if (!activeUserId) {
      setStatusMessage('กรุณาเข้าสู่ระบบ Spotify ก่อนใช้งาน Studio');
      return;
    }

    try {
      const profile = await fetchUserProfile(activeUserId);
      setUser(profile);
      localStorage.setItem('audiovibe_user_id', profile.id);
      const userPlaylists = await fetchPlaylists(profile.id);
      setPlaylists(userPlaylists);

      const target =
        (targetPlaylistId
          ? userPlaylists.find((p) => p.id === targetPlaylistId)
          : null) ||
        userPlaylists[0] ||
        null;

      if (target) {
        let cachedScores: Record<string, number> = {};
        if (typeof window !== 'undefined') {
          try {
            const rawScores = sessionStorage.getItem(`audiovibe_scores_${target.id}`);
            if (rawScores) cachedScores = JSON.parse(rawScores);
            const rawFeatures = sessionStorage.getItem(`audiovibe_features_${target.id}`);
            if (rawFeatures) setAiFeatures(JSON.parse(rawFeatures));
          } catch {
            // ignore storage parse error
          }
        }

        setPlaylist({
          ...target,
          tracks: target.tracks.map((t) => ({
            ...t,
            matchScore: t.matchScore ?? cachedScores[t.id],
          })),
        });
        setStatusMessage(`กำลังเปิดเพลย์ลิสต์ "${target.name}"`);
      }
    } catch (err: unknown) {
      setStatusMessage(`โหลดข้อมูลไม่สำเร็จ: ${getErrorMessage(err)}`);
    }
  }, [setPlaylist, setPlaylists]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadInitialData();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadInitialData]);

  const applyThemeFromPrompt = (promptText: string, presetLabel?: string) => {
    setLastPromptText(`${presetLabel || ''} ${promptText}`);
    let themeToSet: ThemeVibe = 'NATURE';
    if (presetLabel) {
      if (presetLabel.includes('รัก')) {
        themeToSet = 'LOVE';
      } else if (presetLabel.includes('เหงา')) {
        themeToSet = 'RAINY';
      } else if (presetLabel.includes('มัน')) {
        themeToSet = 'FIRE';
      } else {
        themeToSet = 'NATURE';
      }
    } else {
      const isHomeOrChill =
        /บ้าน|กลับบ้าน|ผ่อนคลาย|สมาธิ|ชิล|โฟกัส|study|focus|chill|relax|nostalgia/i.test(
          promptText,
        );
      if (isHomeOrChill) {
        themeToSet = 'NATURE';
      } else if (
        /คลั่งรัก|เพลงรัก|อินเลิฟ|romantic|วาเลนไทน์|\blove\b|หวาน/i.test(
          promptText,
        ) ||
        (/รัก/i.test(promptText) && !/น่ารัก|อนุรักษ์/i.test(promptText))
      ) {
        themeToSet = 'LOVE';
      } else if (
        /เหงา|เศร้า|ร้องไห้|อกหัก|ฝน|rain|sad|alone|depress/i.test(promptText)
      ) {
        themeToSet = 'RAINY';
      } else if (
        /มัน|ตื๊ด|เต้น|rock|dance|club|party|ไฟ|fire|เบสหนัก|สุดเหวี่ยง/i.test(
          promptText,
        )
      ) {
        themeToSet = 'FIRE';
      } else {
        themeToSet = 'NATURE';
      }
    }
    setThemeVibe(themeToSet);
  };

  // Navigate back to Page 3 (/studio?userId=...) when clicking "+ New Playlist"
  const handleNewPlaylistClick = () => {
    const uid = user.id || localStorage.getItem('audiovibe_user_id') || '';
    router.push(uid ? `/studio?userId=${encodeURIComponent(uid)}` : '/studio');
  };

  // Navigate to selected playlist URL (/playlist?userId=...&playlistId=...)
  const handleSelectPlaylist = (id: string) => {
    const selected = playlists.find((p) => p.id === id) || null;
    if (selected) {
      setPlaylist(selected);
      setAiFeatures(null);
      setLastPromptText('');
      setMode('AI_ANALYTICS');
      setStatusMessage(`กำลังเปิดเพลย์ลิสต์ "${selected.name}"`);
    }
    const uid = user.id || localStorage.getItem('audiovibe_user_id') || '';
    router.push(
      `/playlist?userId=${encodeURIComponent(uid)}&playlistId=${encodeURIComponent(id)}`,
    );
  };

  const handleRenamePlaylist = async (targetPlaylist?: Playlist) => {
    const target = targetPlaylist || currentPlaylist;
    if (!target || !user.id) return;
    const newName = prompt('ชื่อเพลย์ลิสต์ใหม่:', target.name);
    if (!newName?.trim()) return;

    const trimmed = newName.trim();
    try {
      await apiRenamePlaylist(user.id, target.id, trimmed);
      const updated = playlists.map((p) =>
        p.id === target.id ? { ...p, name: trimmed } : p,
      );
      setPlaylists(updated);
      if (currentPlaylist?.id === target.id) {
        setPlaylist({ ...currentPlaylist, name: trimmed });
      }
      setStatusMessage(`เปลี่ยนชื่อเป็น "${trimmed}" สำเร็จ`);
    } catch (err: unknown) {
      setStatusMessage(`เปลี่ยนชื่อไม่สำเร็จ: ${getErrorMessage(err)}`);
    }
  };

  const handleDeletePlaylist = async (targetPlaylist?: Playlist) => {
    const target = targetPlaylist || currentPlaylist;
    if (!target || !user.id) return;
    if (!confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบเพลย์ลิสต์ "${target.name}"?`))
      return;

    try {
      await apiDeletePlaylist(user.id, target.id);
      const remaining = playlists.filter((p) => p.id !== target.id);
      setPlaylists(remaining);
      if (currentPlaylist?.id === target.id) {
        const nextPlaylist = remaining[0] || null;
        setPlaylist(nextPlaylist);
        if (nextPlaylist) {
          router.push(
            `/playlist?userId=${encodeURIComponent(user.id)}&playlistId=${encodeURIComponent(nextPlaylist.id)}`,
          );
        } else {
          router.push(`/studio?userId=${encodeURIComponent(user.id)}`);
        }
      }
      setStatusMessage('ลบเพลย์ลิสต์เรียบร้อยแล้ว');
    } catch (err: unknown) {
      setStatusMessage(`ลบเพลย์ลิสต์ไม่สำเร็จ: ${getErrorMessage(err)}`);
    }
  };

  const handleExport = async (targetPlaylist?: Playlist) => {
    const target = targetPlaylist || currentPlaylist;
    const targetTracks = targetPlaylist ? targetPlaylist.tracks || [] : tracks;
    if (!target || targetTracks.length === 0) return;
    setIsExporting(true);
    setStatusMessage(`กำลังส่งออกเพลย์ลิสต์ "${target.name}" ไปยัง Spotify...`);

    try {
      const trackIds = targetTracks.map((t) => t.id);
      const res = await exportPlaylistToSpotify(
        user.id,
        target.id,
        target.name,
        target.isPublic ?? true,
        trackIds,
      );

      const updatedPlaylist: Playlist = {
        ...target,
        isExported: true,
        spotifyPlaylistId: res.spotifyPlaylistId,
      };
      setPlaylists(
        playlists.map((p) => (p.id === target.id ? updatedPlaylist : p)),
      );
      if (currentPlaylist?.id === target.id) {
        setPlaylist(updatedPlaylist);
      }

      setExportModalOpen(true, res.spotifyPlaylistId);
      setStatusMessage('ส่งออกเพลย์ลิสต์เข้า Spotify สำเร็จแล้ว!');
    } catch (err: unknown) {
      setStatusMessage(`Export ไม่สำเร็จ: ${getErrorMessage(err)}`);
    } finally {
      setIsExporting(false);
    }
  };

  // Page 4 Smart Custom Playlist: Replace or Add tracks in currentPlaylist
  const handleAIGenerate = async (
    promptText: string,
    presetLabel?: string,
    modifyAction: PlaylistModifyAction = 'replace',
  ) => {
    if (!currentPlaylist) return;
    setIsGenerating(true);
    setStatusMessage('กำลังวิเคราะห์อารมณ์และสกัด 7 มิติเสียงด้วย AI...');
    applyThemeFromPrompt(promptText, presetLabel);

    try {
      if (!user.id) throw new Error('ต้องเข้าสู่ระบบก่อนใช้ AI แนะนำเพลง');

      const existingIds = tracks.map((t) => t.id);
      const result = await generateAIRecommendations(
        promptText,
        presetLabel,
        existingIds,
      );
      setAiFeatures(result.targetFeatures);

      const isReplace = modifyAction === 'replace';
      const persistedPlaylist = await addTracksToPlaylist(
        user.id,
        currentPlaylist.id,
        result.tracks,
        isReplace,
      );

      const scoreMap = new Map(result.tracks.map((t) => [t.id, t]));
      const prevMap = new Map(tracks.map((t) => [t.id, t]));
      const enrichedPlaylist: Playlist = {
        ...persistedPlaylist,
        tracks: persistedPlaylist.tracks.map((t) => ({
          ...t,
          matchScore:
            scoreMap.get(t.id)?.matchScore ??
            prevMap.get(t.id)?.matchScore ??
            t.matchScore,
          audioFeatures:
            t.audioFeatures ??
            scoreMap.get(t.id)?.audioFeatures ??
            prevMap.get(t.id)?.audioFeatures,
        })),
      };

      if (typeof window !== 'undefined') {
        const scoresObj = Object.fromEntries(
          enrichedPlaylist.tracks
            .filter((t) => t.matchScore)
            .map((t) => [t.id, t.matchScore!]),
        );
        sessionStorage.setItem(
          `audiovibe_scores_${currentPlaylist.id}`,
          JSON.stringify(scoresObj),
        );
        sessionStorage.setItem(
          `audiovibe_features_${currentPlaylist.id}`,
          JSON.stringify(result.targetFeatures),
        );
      }

      setPlaylist(enrichedPlaylist);
      setPlaylists(
        playlists.map((p) =>
          p.id === enrichedPlaylist.id ? enrichedPlaylist : p,
        ),
      );
      setMode('AI_ANALYTICS');
      setStatusMessage(
        isReplace
          ? `เปลี่ยนเพลงในเพลย์ลิสต์ "${currentPlaylist.name}" ด้วย AI สำเร็จ (${result.tracks.length} เพลง)`
          : `เพิ่มเพลงเข้าเพลย์ลิสต์ "${currentPlaylist.name}" ด้วย AI สำเร็จ (+${result.tracks.length} เพลง)`,
      );
    } catch (err: unknown) {
      setStatusMessage(`AI แนะนำไม่สำเร็จ: ${getErrorMessage(err)}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSearch = async (query: string): Promise<Track[]> => {
    return await searchSpotifyTracks(user.id, query);
  };

  const handleAddTrack = async (track: Track) => {
    if (!currentPlaylist || !user.id) {
      setStatusMessage('กรุณาเข้าสู่ระบบและเลือกเพลย์ลิสต์ก่อนเพิ่มเพลง');
      return;
    }
    try {
      const updated = await addTracksToPlaylist(user.id, currentPlaylist.id, [
        track,
      ]);
      setPlaylist(updated);
      setPlaylists(playlists.map((p) => (p.id === updated.id ? updated : p)));
      setStatusMessage(`เพิ่ม "${track.title}" เข้าเพลย์ลิสต์แล้ว`);
    } catch (err: unknown) {
      setStatusMessage(`เพิ่มเพลงไม่สำเร็จ: ${getErrorMessage(err)}`);
    }
  };

  const handleRemoveTrack = async (trackId: string) => {
    if (!currentPlaylist || !user.id) return;
    try {
      const updated = await removeTrackFromPlaylist(
        user.id,
        currentPlaylist.id,
        trackId,
      );
      setPlaylist(updated);
      setPlaylists(playlists.map((p) => (p.id === updated.id ? updated : p)));
      setStatusMessage('ลบเพลงออกจากเพลย์ลิสต์แล้ว');
    } catch (err: unknown) {
      setStatusMessage(`ลบเพลงไม่สำเร็จ: ${getErrorMessage(err)}`);
    }
  };

  const handleReorderTracks = async (fromIndex: number, toIndex: number) => {
    if (!currentPlaylist || !user.id || fromIndex === toIndex) return;
    const trackIds = tracks.map((track) => track.id);
    const [movedTrackId] = trackIds.splice(fromIndex, 1);
    if (!movedTrackId) return;
    trackIds.splice(toIndex, 0, movedTrackId);
    try {
      const updated = await reorderPlaylistTracks(
        user.id,
        currentPlaylist.id,
        trackIds,
      );
      setPlaylist(updated);
      setPlaylists(playlists.map((p) => (p.id === updated.id ? updated : p)));
      setStatusMessage('จัดลำดับเพลงเรียบร้อยแล้ว');
    } catch (err: unknown) {
      setStatusMessage(`จัดลำดับเพลงไม่สำเร็จ: ${getErrorMessage(err)}`);
    }
  };

  const backToStudioHref = user.id
    ? `/studio?userId=${encodeURIComponent(user.id)}`
    : '/studio';

  return (
    <div className="h-screen flex relative transition-colors duration-700 overflow-hidden bg-[#0a0a0c]">
      {/* Bolt-Style Horizon Background with Dynamic Mood Glow (No Vinyl Record) */}
      <MoodHorizonBackground palette={moodPalette} />

      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen((prev) => !prev)}
        isNewPlaylistView={false}
        onNewPlaylistClick={handleNewPlaylistClick}
        onSelectPlaylist={handleSelectPlaylist}
        onRenamePlaylist={handleRenamePlaylist}
        onDeletePlaylist={handleDeletePlaylist}
        onExportPlaylist={handleExport}
        onRefreshPlaylists={loadInitialData}
        isExporting={isExporting}
        accentColor={moodPalette.accent}
        accentGlow={moodPalette.glow}
      />

      {/* Right Content Area: Fits 100% inside 1 screen (h-screen overflow-hidden) */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative z-10 px-5 py-3">
        {/* Compact Top Header with Mood Badge & User Profile at Top-Right */}
        <header className="flex items-center justify-end gap-3 pb-2 shrink-0">
          <span
            style={{
              color: moodPalette.accent,
              borderColor: `${moodPalette.accent}45`,
              backgroundColor: `${moodPalette.accent}15`,
              boxShadow: `0 0 14px ${moodPalette.glow}`,
            }}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-500"
          >
            <Sparkles className="w-3 h-3" />
            {moodPalette.label}
          </span>

          <div
            style={{
              borderColor: `${moodPalette.accent}35`,
              boxShadow: `0 0 18px ${moodPalette.glow}`,
            }}
            className="flex items-center gap-2.5 bg-[#141418]/85 border rounded-2xl px-3.5 py-2 backdrop-blur-xl transition-all duration-500"
          >
            <div className="w-9 h-9 rounded-full overflow-hidden bg-[#1b3827] border-2 border-[#1ed760] shrink-0">
              {user?.profileImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.profileImageUrl}
                  alt={user.displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/50">
                  <UserIcon className="w-4 h-4" />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-bold text-white truncate max-w-[160px]">
                {user?.displayName || 'กำลังโหลด...'}
              </h3>
            </div>
          </div>
        </header>

        {/* PAGE 4: 2-Column Single-Screen Workspace */}
        <main className="flex-1 min-h-0 flex flex-col lg:flex-row gap-4 max-w-7xl w-full mx-auto overflow-hidden">
          {/* LEFT COLUMN: Current Playlist Summary + 7-Axis Radar Profile + Target Stat Table */}
          <div className="w-full lg:w-[34%] h-full min-h-0 flex flex-col gap-2.5 overflow-hidden">
            {/* 1. Compact Current Playlist Summary Card */}
            <section
              style={{
                borderColor: `${moodPalette.accent}38`,
                boxShadow: `0 0 28px ${moodPalette.glow}, 0 8px 30px rgba(0,0,0,0.5)`,
              }}
              className="shrink-0 bg-[#121216]/75 border rounded-2xl p-3.5 backdrop-blur-xl flex flex-col gap-2.5 transition-all duration-500"
            >
              <div className="flex items-center gap-2 pb-1.5 border-b border-white/10">
                <ListMusic
                  style={{ color: moodPalette.accent }}
                  className="w-4 h-4 transition-colors duration-500"
                />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Current Playlist Summary
                </h3>
              </div>

              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-bold text-white truncate">
                  {currentPlaylist?.name || 'กำลังโหลดเพลย์ลิสต์...'}
                </div>
                <div className="text-[11px] text-white/60 shrink-0 flex items-center gap-1.5">
                  <span>{tracks.length} เพลง</span>
                  <span>•</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      currentPlaylist?.isExported
                        ? 'bg-[#1ed760]/20 text-[#1ed760] border border-[#1ed760]/30'
                        : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {currentPlaylist?.isExported
                      ? '✓ Exported'
                      : 'Local Only'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleRenamePlaylist(currentPlaylist || undefined)}
                  className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-xs text-white/85 font-medium transition-all cursor-pointer"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Rename</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDeletePlaylist(currentPlaylist || undefined)}
                  className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-xs text-[#ff9999] font-medium transition-all cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Delete</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => handleExport(currentPlaylist || undefined)}
                disabled={tracks.length === 0 || isExporting}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs bg-[#1ed760] hover:bg-[#1db954] text-[#06140a] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(30,215,96,0.3)] cursor-pointer"
              >
                {isExporting ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : currentPlaylist?.isExported ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Sync with Spotify</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Export to Spotify</span>
                  </>
                )}
              </button>
            </section>

            {/* 2 & 3. 7-Axis Audio Vibe Vector Profile + Dimension / Target Stat Table */}
            <AudioRadarChart
              features={effectiveRadarFeatures}
              title="7-Axis Audio Vibe Vector Profile"
              accentColor={moodPalette.accent}
              accentGlow={moodPalette.glow}
            />
          </div>

          {/* RIGHT COLUMN: Smart Custom Playlist (Modify Mode) + Scrollable Track List + Search & Add Tracks */}
          <div className="w-full lg:w-[66%] h-full min-h-0 flex flex-col gap-2.5 overflow-hidden">
            {/* 1. Smart Custom Playlist (Modify Mode) */}
            <AIPromptBox
              mode="modify"
              onGenerate={handleAIGenerate}
              isLoading={isGenerating}
              accentColor={moodPalette.accent}
              accentGlow={moodPalette.glow}
            />

            {/* 2. Current Playlist Tracks (Fills middle height & scrolls internally, ~5 tracks visible) */}
            <section
              style={{
                borderColor: `${moodPalette.accent}38`,
                boxShadow: `0 0 28px ${moodPalette.glow}, 0 8px 30px rgba(0,0,0,0.5)`,
              }}
              className="flex-1 min-h-0 bg-[#121216]/75 border rounded-2xl p-3 backdrop-blur-xl flex flex-col overflow-hidden transition-all duration-500"
            >
              <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-white/10 shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                  <ListMusic
                    style={{ color: moodPalette.accent }}
                    className="w-4 h-4 shrink-0 transition-colors duration-500"
                  />
                  <h3 className="text-xs font-bold text-white truncate">
                    {currentPlaylist?.name || 'Playlist Tracks'}
                  </h3>
                  <span
                    style={{
                      color: moodPalette.accent,
                      borderColor: `${moodPalette.accent}40`,
                      backgroundColor: `${moodPalette.accent}15`,
                    }}
                    className="text-[10px] px-2 py-0 rounded-full border shrink-0 font-medium"
                  >
                    {tracks.length} เพลง
                  </span>
                </div>
              </div>

              <div className="flex-1 min-h-0 space-y-1 overflow-y-auto pr-1 custom-scrollbar">
                {tracks.length > 0 ? (
                  tracks.map((track, idx) => (
                    <TrackItem
                      key={track.id}
                      track={track}
                      index={idx}
                      totalTracks={tracks.length}
                      onRemove={handleRemoveTrack}
                      onMove={handleReorderTracks}
                      accentColor={moodPalette.accent}
                    />
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center rounded-xl bg-black/40 border border-dashed border-white/15 p-4">
                    <BarChart3 className="w-6 h-6 text-white/30 mb-1.5" />
                    <p className="text-xs font-medium text-white/70">
                      ยังไม่มีเพลงในเพลย์ลิสต์นี้
                    </p>
                    <p className="text-[11px] text-white/40 mt-0.5">
                      ใช้กล่อง Smart Custom Playlist ด้านบนเพื่อเปลี่ยน/เพิ่มเพลง หรือค้นหาเพลงด้านล่างได้เลย
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* 3. Search & Add Tracks (Manual) */}
            <SearchSpotify
              onSearch={handleSearch}
              onAddTrack={handleAddTrack}
              accentColor={moodPalette.accent}
              accentGlow={moodPalette.glow}
            />
          </div>
        </main>
      </div>

      <ExportSuccessModal />
    </div>
  );
}

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
import { BackgroundVibe } from '../../components/BackgroundVibe';
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

const AudioRadarChart = dynamic(
  () => import('../../components/RadarChart').then((mod) => mod.AudioRadarChart),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 flex items-center justify-center bg-[#121d17]/80 rounded-2xl border border-[#234230] text-[#70947e] text-xs animate-pulse">
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
    themeVibe,
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
        // Restore cached matchScores / aiFeatures from sessionStorage if available
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

  // Page 4 AI Smart Recommend: Replace or Add tracks in currentPlaylist
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
    <div className="h-screen flex relative transition-colors duration-700 overflow-hidden">
      <BackgroundVibe theme={themeVibe} />

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
      />

      {/* Right Content Area: Fits 100% inside 1 screen (h-screen overflow-hidden) */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative z-10 px-5 py-3">
        {/* Compact Top Header with User Profile at Top-Right */}
        <header className="flex items-center justify-between gap-4 pb-2.5 mb-3 border-b border-[#1b3a2a] shrink-0">
          <div className="flex items-center gap-3">
            <Link
              href={backToStudioHref}
              className="flex items-center gap-2 text-[#7fa38c] hover:text-white transition-colors"
              title="กลับหน้าสร้างเพลย์ลิสต์ใหม่"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#1ed760] to-[#0f6832] flex items-center justify-center shadow shadow-[#1ed760]/20">
                <Music className="w-4 h-4 text-[#05160b]" />
              </div>
              <div>
                <h1 className="text-lg font-extrabold text-white tracking-tight">
                  Audio<span className="text-[#1ed760]">Vibe</span> Studio
                </h1>
                <p className="text-[11px] text-[#82a691] truncate max-w-md">
                  {statusMessage}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 bg-[#121f18]/95 border border-[#234230] rounded-2xl px-3.5 py-2 shadow-lg backdrop-blur">
            <div className="w-9 h-9 rounded-full overflow-hidden bg-[#1b3827] border-2 border-[#1ed760] shrink-0">
              {user?.profileImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.profileImageUrl}
                  alt={user.displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#558367]">
                  <UserIcon className="w-4 h-4" />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-bold text-white truncate max-w-[160px]">
                {user?.displayName || 'กำลังโหลด...'}
              </h3>
              <p className="text-[10px] text-[#82a691] truncate font-mono max-w-[180px]">
                Spotify: {user?.spotifyId || 'unknown'}
              </p>
            </div>
          </div>
        </header>

        {/* PAGE 4: 2-Column Single-Screen Workspace */}
        <main className="flex-1 min-h-0 flex flex-col lg:flex-row gap-4 max-w-7xl w-full mx-auto overflow-hidden">
          {/* LEFT COLUMN: Current Playlist Summary + 7-Axis Radar Profile + Target Stat Table */}
          <div className="w-full lg:w-[34%] h-full min-h-0 flex flex-col gap-2.5 overflow-hidden">
            {/* 1. Compact Current Playlist Summary Card */}
            <section className="shrink-0 bg-[#121f18]/90 border border-[#234230] rounded-2xl p-3.5 shadow-lg backdrop-blur flex flex-col gap-2.5">
              <div className="flex items-center gap-2 pb-1.5 border-b border-[#1f3a2b]">
                <ListMusic className="w-4 h-4 text-[#1ed760]" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Current Playlist Summary
                </h3>
              </div>

              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-bold text-white truncate">
                  {currentPlaylist?.name || 'กำลังโหลดเพลย์ลิสต์...'}
                </div>
                <div className="text-[11px] text-[#82a691] shrink-0 flex items-center gap-1.5">
                  <span>{tracks.length} เพลง</span>
                  <span>•</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      currentPlaylist?.isExported
                        ? 'bg-[#1b432c] text-[#1ed760]'
                        : 'bg-[#2a291e] text-[#e0b84c]'
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
                  className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-[#1a2d21] hover:bg-[#223d2c] border border-[#2a4d38] text-xs text-[#c2e2ce] font-medium transition-all"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Rename</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDeletePlaylist(currentPlaylist || undefined)}
                  className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-[#2b1717] hover:bg-[#3d1f1f] border border-[#522929] text-xs text-[#ff9999] font-medium transition-all"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Delete</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => handleExport(currentPlaylist || undefined)}
                disabled={tracks.length === 0 || isExporting}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs bg-[#1ed760] hover:bg-[#1db954] text-[#06140a] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md hover:shadow-[#1ed760]/25"
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
            />
          </div>

          {/* RIGHT COLUMN: AI Smart Recommend (Modify Mode) + Scrollable Track List + Search & Add Tracks */}
          <div className="w-full lg:w-[66%] h-full min-h-0 flex flex-col gap-2.5 overflow-hidden">
            {/* 1. AI Smart Recommend (Modify Mode) */}
            <AIPromptBox
              mode="modify"
              onGenerate={handleAIGenerate}
              isLoading={isGenerating}
            />

            {/* 2. Current Playlist Tracks (Fills middle height & scrolls internally, ~5 tracks visible) */}
            <section className="flex-1 min-h-0 bg-[#121f18]/90 border border-[#234230] rounded-2xl p-3 shadow-lg backdrop-blur flex flex-col overflow-hidden">
              <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-[#1f3a2b] shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                  <ListMusic className="w-4 h-4 text-[#1ed760] shrink-0" />
                  <h3 className="text-xs font-bold text-white truncate">
                    {currentPlaylist?.name || 'Playlist Tracks'}
                  </h3>
                  <span className="text-[10px] px-2 py-0 rounded-full bg-[#1b3628] text-[#86a894] shrink-0">
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
                    />
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center rounded-xl bg-[#0c1611]/60 border border-dashed border-[#1f3a2b] p-4">
                    <BarChart3 className="w-6 h-6 text-[#3d634d] mb-1.5" />
                    <p className="text-xs font-medium text-[#9eb7a8]">
                      ยังไม่มีเพลงในเพลย์ลิสต์นี้
                    </p>
                    <p className="text-[11px] text-[#5e7d6b] mt-0.5">
                      ใช้กล่อง AI ด้านบนเพื่อเปลี่ยน/เพิ่มเพลง หรือค้นหาเพลงด้านล่างได้เลย
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* 3. Search & Add Tracks (Manual) */}
            <SearchSpotify
              onSearch={handleSearch}
              onAddTrack={handleAddTrack}
            />
          </div>
        </main>
      </div>

      <ExportSuccessModal />
    </div>
  );
}

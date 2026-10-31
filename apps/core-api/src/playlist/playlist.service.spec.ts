import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { PlaylistService } from './playlist.service';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { SpotifyAdapter } from '../music-provider/spotify.adapter';
import { TrackService } from '../track/track.service';
import { TrackDTO } from '../dto/track.dto';

describe('PlaylistService', () => {
  let service: PlaylistService;
  let mockPrisma: any;
  let mockRedisClient: any;
  let mockRedisService: any;
  let mockSpotifyAdapter: any;
  let mockTrackService: any;

  const mockUser = {
    id: 'user-uuid-1',
    spotifyId: 'spotify-user-1',
  };

  const mockTrackDto: TrackDTO = {
    id: 'track-001',
    title: 'Test Song',
    artistName: 'Test Artist',
    albumName: 'Test Album',
    albumCoverUrl: 'https://example.com/cover.jpg',
    durationMs: 200000,
    popularity: 80,
    audioFeatures: {
      danceability: 0.8,
      valence: 0.6,
      energy: 0.7,
      acousticness: 0.2,
      instrumentalness: 0.0,
      liveness: 0.1,
      speechiness: 0.05,
    },
  };

  const mockPlaylistEntity = {
    id: 'playlist-uuid-1',
    userId: mockUser.id,
    name: 'My Cool Playlist',
    description: 'A test playlist',
    isPublic: true,
    isExported: false,
    spotifyPlaylistId: null,
    displayMode: 'AI_ANALYTICS',
    createdAt: new Date(),
    updatedAt: new Date(),
    playlistTracks: [
      {
        id: 'pt-1',
        playlistId: 'playlist-uuid-1',
        trackId: 'track-001',
        order: 0,
        track: {
          id: 'track-001',
          title: 'Test Song',
          artistName: 'Test Artist',
          albumName: 'Test Album',
          albumCoverUrl: 'https://example.com/cover.jpg',
          durationMs: 200000,
          popularity: 80,
          audioFeature: {
            danceability: 0.8,
            valence: 0.6,
            energy: 0.7,
            acousticness: 0.2,
            instrumentalness: 0.0,
            liveness: 0.1,
            speechiness: 0.05,
          },
        },
      },
    ],
  };

  beforeEach(async () => {
    mockPrisma = {
      user: {
        findUnique: vi.fn(),
      },
      playlist: {
        create: vi.fn(),
        findMany: vi.fn(),
        findFirst: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      playlistTrack: {
        findMany: vi.fn(),
        upsert: vi.fn(),
        delete: vi.fn(),
        update: vi.fn(),
      },
      $transaction: vi.fn(async (operations) => Promise.all(operations)),
    };

    mockRedisClient = {
      get: vi.fn(),
      set: vi.fn(),
    };

    mockRedisService = {
      getClient: vi.fn(() => mockRedisClient),
    };

    mockSpotifyAdapter = {
      searchTracks: vi.fn(),
      createPlaylist: vi.fn(),
      addTracksToPlaylist: vi.fn(),
    };

    mockTrackService = {
      upsert: vi.fn(),
      toDto: vi.fn((track: any) => ({
        id: track.id,
        title: track.title,
        artistName: track.artistName,
        albumName: track.albumName,
        albumCoverUrl: track.albumCoverUrl,
        durationMs: track.durationMs,
        popularity: track.popularity,
        audioFeatures: track.audioFeature ?? null,
      })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlaylistService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: RedisService, useValue: mockRedisService },
        { provide: SpotifyAdapter, useValue: mockSpotifyAdapter },
        { provide: TrackService, useValue: mockTrackService },
      ],
    }).compile();

    service = module.get<PlaylistService>(PlaylistService);
  });

  it('Service ควรถูกสร้างขึ้นมาได้อย่างถูกต้อง (Defined)', () => {
    expect(service).toBeDefined();
  });

  describe('searchTracks()', () => {
    it('ควรคืนค่าผลลัพธ์จาก Redis Cache ทันทีเมื่อมีข้อมูลแคช (Cache Hit)', async () => {
      mockRedisClient.get.mockResolvedValue(JSON.stringify([mockTrackDto]));

      const results = await service.searchTracks(mockUser.id, '  pop music  ', 10, 0);

      expect(results).toEqual([mockTrackDto]);
      expect(mockSpotifyAdapter.searchTracks).not.toHaveBeenCalled();
      expect(mockRedisClient.get).toHaveBeenCalledWith(expect.stringMatching(/^search:[a-f0-9]{64}$/));
    });

    it('ควรดึงผลลัพธ์จาก SpotifyAdapter และบันทึกลง Redis พร้อม TTL 24 ชม. เมื่อ Cache Miss', async () => {
      mockRedisClient.get.mockResolvedValue(null);
      mockSpotifyAdapter.searchTracks.mockResolvedValue([mockTrackDto]);
      mockRedisClient.set.mockResolvedValue('OK');

      const results = await service.searchTracks(mockUser.id, 'rock', 15);

      expect(results).toEqual([mockTrackDto]);
      expect(mockSpotifyAdapter.searchTracks).toHaveBeenCalledWith(mockUser.id, 'rock', 15, 0);
      expect(mockRedisClient.set).toHaveBeenCalledWith(
        expect.stringMatching(/^search:[a-f0-9]{64}$/),
        JSON.stringify([mockTrackDto]),
        'EX',
        86400,
      );
    });
  });

  describe('create()', () => {
    it('ควรโยน Error "User not found" หากไม่พบผู้ใช้ในระบบ', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.create('unknown-user', { name: 'Chill Vibes' } as any),
      ).rejects.toThrow('User not found');
    });

    it('ควรสร้างเพลย์ลิสต์ใหม่พร้อมกำหนดค่า isPublic เริ่มต้นเป็น true หากไม่ได้ระบุมา', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.playlist.create.mockResolvedValue(mockPlaylistEntity);

      const request = { name: 'Morning Coffee', description: 'Chill lo-fi' };
      const result = await service.create(mockUser.id, request as any);

      expect(mockPrisma.playlist.create).toHaveBeenCalledWith({
        data: {
          userId: mockUser.id,
          name: request.name,
          description: request.description,
          isPublic: true,
        },
      });
      expect(result).toEqual(mockPlaylistEntity);
    });
  });

  describe('list()', () => {
    it('ควรคืนค่ารายการเพลย์ลิสต์ของผู้ใช้ทั้งหมดพร้อมแปลงโครงสร้าง Response', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.playlist.findMany.mockResolvedValue([mockPlaylistEntity]);

      const list = await service.list(mockUser.id);

      expect(list).toHaveLength(1);
      expect(list[0].playlistId).toBe(mockPlaylistEntity.id);
      expect(list[0].tracks).toHaveLength(1);
      expect(list[0].averageAudioFeatures?.danceability).toBe(0.8);
      expect(list[0].displayMode).toBe('AI_ANALYTICS');
    });
  });

  describe('get()', () => {
    it('ควรคืนค่าเพลย์ลิสต์ที่ค้นพบและคำนวณ averageAudioFeatures ถูกต้อง', async () => {
      mockPrisma.playlist.findFirst.mockResolvedValue(mockPlaylistEntity);

      const result = await service.get(mockUser.id, mockPlaylistEntity.id);

      expect(result.playlistId).toBe(mockPlaylistEntity.id);
      expect(result.name).toBe(mockPlaylistEntity.name);
      expect(result.averageAudioFeatures).toBeDefined();
    });

    it('ควรโยน Error "Playlist not found" หากไม่พบเพลย์ลิสต์หรือผู้ใช้ไม่ได้เป็นเจ้าของ', async () => {
      mockPrisma.playlist.findFirst.mockResolvedValue(null);

      await expect(service.get(mockUser.id, 'invalid-playlist-id')).rejects.toThrow('Playlist not found');
    });
  });

  describe('update()', () => {
    it('ควรอัปเดตข้อมูลเพลย์ลิสต์เฉพาะฟิลด์ที่ส่งเข้ามา', async () => {
      mockPrisma.playlist.findFirst.mockResolvedValue(mockPlaylistEntity);
      mockPrisma.playlist.update.mockResolvedValue({
        ...mockPlaylistEntity,
        name: 'New Name',
      });

      await service.update(mockUser.id, mockPlaylistEntity.id, {
        name: 'New Name',
        isPublic: false,
      } as any);

      expect(mockPrisma.playlist.update).toHaveBeenCalledWith({
        where: { id: mockPlaylistEntity.id },
        data: {
          name: 'New Name',
          isPublic: false,
        },
      });
    });
  });

  describe('remove()', () => {
    it('ควรลบเพลย์ลิสต์และส่งคืนสถานะ deleted สำเร็จ', async () => {
      mockPrisma.playlist.findFirst.mockResolvedValue(mockPlaylistEntity);
      mockPrisma.playlist.delete.mockResolvedValue(mockPlaylistEntity);

      const result = await service.remove(mockUser.id, mockPlaylistEntity.id);

      expect(result).toEqual({ deleted: true, playlistId: mockPlaylistEntity.id });
      expect(mockPrisma.playlist.delete).toHaveBeenCalledWith({
        where: { id: mockPlaylistEntity.id },
      });
    });
  });

  describe('addTracks()', () => {
    it('ควร upsert แทร็ก, บันทึก playlistTrack ตามลำดับใหม่ และสลับโหมดเป็น MANUAL_MANAGER', async () => {
      mockPrisma.playlist.findFirst.mockResolvedValue(mockPlaylistEntity);
      mockPrisma.playlistTrack.findMany.mockResolvedValue([{ order: 3 }]); // ลำดับสุดท้ายเดิมคือ 3 -> ตัวถัดไปคือ 4
      mockPrisma.playlistTrack.upsert.mockResolvedValue({});
      mockPrisma.playlist.update.mockResolvedValue({});

      const request = {
        tracks: [mockTrackDto],
      };

      const result = await service.addTracks(mockUser.id, mockPlaylistEntity.id, request as any);

      expect(mockTrackService.upsert).toHaveBeenCalledWith(mockTrackDto);
      expect(mockPrisma.playlistTrack.upsert).toHaveBeenCalledWith({
        where: { playlistId_trackId: { playlistId: mockPlaylistEntity.id, trackId: mockTrackDto.id } },
        create: { playlistId: mockPlaylistEntity.id, trackId: mockTrackDto.id, order: 4 },
        update: {},
      });
      expect(mockPrisma.playlist.update).toHaveBeenCalledWith({
        where: { id: mockPlaylistEntity.id },
        data: { displayMode: 'MANUAL_MANAGER' },
      });
      expect(result).toBeDefined();
    });

    it('ควรคำนวณ order เริ่มต้นจาก 0 เมื่อเพลย์ลิสต์ยังไม่มีเพลงมาก่อน และรองรับฟิลด์ trackIds โดยตรง', async () => {
      mockPrisma.playlist.findFirst.mockResolvedValue(mockPlaylistEntity);
      mockPrisma.playlistTrack.findMany.mockResolvedValue([]); // ยังไม่มีเพลง -> order เริ่มที่ 0
      mockPrisma.playlistTrack.upsert.mockResolvedValue({});
      mockPrisma.playlist.update.mockResolvedValue({});

      await service.addTracks(mockUser.id, mockPlaylistEntity.id, {
        trackIds: ['track-999'],
      } as any);

      expect(mockPrisma.playlistTrack.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({ order: 0 }),
        }),
      );
    });
  });

  describe('removeTrack()', () => {
    it('ควรลบเพลงตามคู่ playlistId และ trackId และคืนค่าเพลย์ลิสต์ล่าสุด', async () => {
      mockPrisma.playlist.findFirst.mockResolvedValue(mockPlaylistEntity);
      mockPrisma.playlistTrack.delete.mockResolvedValue({});

      const result = await service.removeTrack(mockUser.id, mockPlaylistEntity.id, 'track-001');

      expect(mockPrisma.playlistTrack.delete).toHaveBeenCalledWith({
        where: { playlistId_trackId: { playlistId: mockPlaylistEntity.id, trackId: 'track-001' } },
      });
      expect(result.playlistId).toBe(mockPlaylistEntity.id);
    });
  });

  describe('reorder()', () => {
    it('ควรจัดลำดับเพลงใหม่ผ่าน Database Transaction', async () => {
      mockPrisma.playlist.findFirst.mockResolvedValue(mockPlaylistEntity);

      const request = {
        trackIds: ['track-002', 'track-001'],
      };

      await service.reorder(mockUser.id, mockPlaylistEntity.id, request as any);

      expect(mockPrisma.$transaction).toHaveBeenCalled();
      expect(mockPrisma.playlistTrack.update).toHaveBeenCalledWith({
        where: { playlistId_trackId: { playlistId: mockPlaylistEntity.id, trackId: 'track-002' } },
        data: { order: 0 },
      });
      expect(mockPrisma.playlistTrack.update).toHaveBeenCalledWith({
        where: { playlistId_trackId: { playlistId: mockPlaylistEntity.id, trackId: 'track-001' } },
        data: { order: 1 },
      });
    });
  });

  describe('exportToSpotify()', () => {
    it('ควรสร้างเพลย์ลิสต์บน Spotify, แอดเพลงตาม trackIds ที่ระบุ และบันทึกสถานะ isExported: true', async () => {
      mockPrisma.playlist.findFirst.mockResolvedValue(mockPlaylistEntity);
      mockSpotifyAdapter.createPlaylist.mockResolvedValue('spotify-playlist-xyz');
      mockSpotifyAdapter.addTracksToPlaylist.mockResolvedValue(true);
      mockPrisma.playlist.update.mockResolvedValue({
        id: mockPlaylistEntity.id,
        spotifyPlaylistId: 'spotify-playlist-xyz',
        isExported: true,
        exportedAt: new Date(),
      });

      const request = {
        userId: mockUser.id,
        playlistId: mockPlaylistEntity.id,
        name: 'Exported Album',
        isPublic: true,
        trackIds: ['track-001', 'track-002'],
      };

      const result = await service.exportToSpotify(request as any);

      expect(mockSpotifyAdapter.createPlaylist).toHaveBeenCalledWith(mockUser.id, 'Exported Album', true);
      expect(mockSpotifyAdapter.addTracksToPlaylist).toHaveBeenCalledWith(mockUser.id, 'spotify-playlist-xyz', request.trackIds);
      expect(mockPrisma.playlist.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: mockPlaylistEntity.id },
          data: expect.objectContaining({
            isExported: true,
            spotifyPlaylistId: 'spotify-playlist-xyz',
          }),
        }),
      );
      expect(result.isExported).toBe(true);
    });

    it('ควรดึง trackIds จากเพลย์ลิสต์เดิมอัตโนมัติหากไม่ได้ระบุ trackIds มาในคำขอส่งออก', async () => {
      mockPrisma.playlist.findFirst.mockResolvedValue(mockPlaylistEntity);
      mockSpotifyAdapter.createPlaylist.mockResolvedValue('spotify-playlist-123');
      mockSpotifyAdapter.addTracksToPlaylist.mockResolvedValue(true);
      mockPrisma.playlist.update.mockResolvedValue({
        id: mockPlaylistEntity.id,
        spotifyPlaylistId: 'spotify-playlist-123',
        isExported: true,
        exportedAt: new Date(),
      });

      const requestWithoutIds = {
        userId: mockUser.id,
        playlistId: mockPlaylistEntity.id,
        name: 'Auto Tracks Export',
        isPublic: false,
        trackIds: [],
      };

      await service.exportToSpotify(requestWithoutIds as any);

      expect(mockSpotifyAdapter.addTracksToPlaylist).toHaveBeenCalledWith(
        mockUser.id,
        'spotify-playlist-123',
        ['track-001'],
      );
    });
  });

  describe('toPlaylistResponse() - Average Features Calculation', () => {
    it('ควรกำหนดค่า averageAudioFeatures เป็น null หากเพลย์ลิสต์ไม่มีเพลงที่มี audioFeatures เลย', async () => {
      const playlistWithoutFeatures = {
        ...mockPlaylistEntity,
        playlistTracks: [
          {
            track: {
              id: 'track-no-feat',
              audioFeature: null,
            },
          },
        ],
      };

      mockPrisma.playlist.findFirst.mockResolvedValue(playlistWithoutFeatures);

      const result = await service.get(mockUser.id, mockPlaylistEntity.id);

      expect(result.averageAudioFeatures).toBeNull();
    });
  });
});
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { TrackService } from './track.service';
import { PrismaService } from '../prisma/prisma.service';
import { TrackDTO } from '../dto/track.dto';

describe('TrackService', () => {
    let service: TrackService;
    let mockPrisma: any;

    beforeEach(async () => {
        mockPrisma = {
            track: {
                upsert: vi.fn(),
                findMany: vi.fn(),
            },
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TrackService,
                {
                    provide: PrismaService,
                    useValue: mockPrisma,
                },
            ],
        }).compile();

        service = module.get<TrackService>(TrackService);
    });

    it('Service ควรถูกสร้างขึ้นมาได้อย่างถูกต้อง (Defined)', () => {
        expect(service).toBeDefined();
    });

    describe('upsert()', () => {
        it('ควรเรียก prisma.track.upsert พร้อมสร้างหรืออัปเดตข้อมูลแทร็กอย่างถูกต้อง', async () => {
            const mockTrackDto: TrackDTO = {
                id: 'track-123',
                title: 'Shape of You',
                artistName: 'Ed Sheeran',
                albumName: '÷ (Divide)',
                albumCoverUrl: 'https://example.com/cover.jpg',
                durationMs: 233712,
                popularity: 85,
                audioFeatures: null,
            };

            const expectedResult = {
                id: mockTrackDto.id,
                title: mockTrackDto.title,
                artistName: mockTrackDto.artistName,
                albumName: mockTrackDto.albumName,
                albumCoverUrl: mockTrackDto.albumCoverUrl,
                durationMs: mockTrackDto.durationMs,
                popularity: mockTrackDto.popularity,
            };

            mockPrisma.track.upsert.mockResolvedValue(expectedResult);

            const result = await service.upsert(mockTrackDto);

            expect(result).toEqual(expectedResult);
            expect(mockPrisma.track.upsert).toHaveBeenCalledWith({
                where: { id: mockTrackDto.id },
                create: {
                    id: mockTrackDto.id,
                    title: mockTrackDto.title,
                    artistName: mockTrackDto.artistName,
                    albumName: mockTrackDto.albumName,
                    albumCoverUrl: mockTrackDto.albumCoverUrl,
                    durationMs: mockTrackDto.durationMs,
                    popularity: mockTrackDto.popularity,
                },
                update: {
                    title: mockTrackDto.title,
                    artistName: mockTrackDto.artistName,
                    albumName: mockTrackDto.albumName,
                    albumCoverUrl: mockTrackDto.albumCoverUrl,
                    durationMs: mockTrackDto.durationMs,
                    popularity: mockTrackDto.popularity,
                },
            });
        });
    });

    describe('findByIds()', () => {
        it('ควรเรียก prisma.track.findMany พร้อม include audioFeature ตามรายการ IDs', async () => {
            const mockTracksFromDb = [
                {
                    id: 'track-1',
                    title: 'Song 1',
                    artistName: 'Artist 1',
                    albumName: 'Album 1',
                    albumCoverUrl: 'https://example.com/1.jpg',
                    durationMs: 180000,
                    popularity: 70,
                    audioFeature: {
                        danceability: 0.8,
                        energy: 0.7,
                        valence: 0.9,
                    },
                },
            ];

            mockPrisma.track.findMany.mockResolvedValue(mockTracksFromDb);

            const result = await service.findByIds(['track-1']);

            expect(result).toEqual(mockTracksFromDb);
            expect(mockPrisma.track.findMany).toHaveBeenCalledWith({
                where: { id: { in: ['track-1'] } },
                include: { audioFeature: true },
            });
        });
    });

    describe('toDto()', () => {
        it('ควรแปลง Entity เป็น TrackDTO และแนบ audioFeatures เมื่อมีข้อมูล audioFeature', () => {
            const mockTrackEntity = {
                id: 'track-abc',
                title: 'Blinding Lights',
                artistName: 'The Weeknd',
                albumName: 'After Hours',
                albumCoverUrl: 'https://example.com/after-hours.jpg',
                durationMs: 200000,
                popularity: 90,
                audioFeature: {
                    danceability: 0.514,
                    valence: 0.334,
                    energy: 0.73,
                    acousticness: 0.00146,
                    instrumentalness: 0.000095,
                    liveness: 0.0897,
                    speechiness: 0.0598,
                },
            };

            const dto = service.toDto(mockTrackEntity);

            expect(dto.id).toBe(mockTrackEntity.id);
            expect(dto.title).toBe(mockTrackEntity.title);
            expect(dto.artistName).toBe(mockTrackEntity.artistName);
            expect(dto.albumName).toBe(mockTrackEntity.albumName);
            expect(dto.albumCoverUrl).toBe(mockTrackEntity.albumCoverUrl);
            expect(dto.durationMs).toBe(mockTrackEntity.durationMs);
            expect(dto.popularity).toBe(mockTrackEntity.popularity);
            expect(dto.audioFeatures).toEqual(mockTrackEntity.audioFeature);
        });

        it('ควรแปลง Entity เป็น TrackDTO โดยกำหนด audioFeatures เป็น null เมื่อไม่มี audioFeature', () => {
            const mockTrackEntityWithoutFeature = {
                id: 'track-xyz',
                title: 'New Track',
                artistName: 'Indie Artist',
                albumName: null,
                albumCoverUrl: null,
                durationMs: 150000,
                popularity: 20,
                audioFeature: null,
            };

            const dto = service.toDto(mockTrackEntityWithoutFeature);

            expect(dto.id).toBe('track-xyz');
            expect(dto.audioFeatures).toBeNull();
        });
    });
});
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { SpotifyAdapter } from './spotify.adapter';
import { SpotifyApiClient } from './spotify-api.client';
import { UsersService } from '../users/users.service';
import { SpotifyTokenService } from '../spotify/spotify-token.service';

describe('SpotifyAdapter', () => {
    let adapter: SpotifyAdapter;
    let mockApiClient: any;
    let mockUsersService: any;
    let mockTokenService: any;

    const mockUser = {
        id: 'user-001',
        spotifyId: 'spotify-user-001',
    };

    beforeEach(async () => {
        mockApiClient = {
            createSpotifyPlaylist: vi.fn(),
            addItemsToPlaylist: vi.fn(),
            fetchTracksMetadata: vi.fn(),
            searchTracks: vi.fn(),
        };

        mockUsersService = {
            findById: vi.fn(),
        };

        mockTokenService = {
            getValidAccessToken: vi.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SpotifyAdapter,
                { provide: SpotifyApiClient, useValue: mockApiClient },
                { provide: UsersService, useValue: mockUsersService },
                { provide: SpotifyTokenService, useValue: mockTokenService },
            ],
        }).compile();

        adapter = module.get<SpotifyAdapter>(SpotifyAdapter);
    });

    it('Adapter ควรถูกสร้างขึ้นมาได้อย่างถูกต้อง (Defined)', () => {
        expect(adapter).toBeDefined();
    });

    describe('createPlaylist()', () => {
        it('ควรโยน Error "User not found" หากไม่พบผู้ใช้ในระบบ', async () => {
            mockUsersService.findById.mockResolvedValue(null);

            await expect(adapter.createPlaylist('unknown', 'My Playlist', true)).rejects.toThrow('User not found');
        });

        it('ควรสร้างเพลย์ลิสต์บน Spotify และคืนค่า Playlist ID ถูกต้อง', async () => {
            mockUsersService.findById.mockResolvedValue(mockUser);
            mockTokenService.getValidAccessToken.mockResolvedValue('valid-token-123');
            mockApiClient.createSpotifyPlaylist.mockResolvedValue({ id: 'spotify-pl-999' });

            const result = await adapter.createPlaylist(mockUser.id, 'Study Music', false);

            expect(result).toBe('spotify-pl-999');
            expect(mockTokenService.getValidAccessToken).toHaveBeenCalledWith(mockUser.id);
            expect(mockApiClient.createSpotifyPlaylist).toHaveBeenCalledWith('Study Music', false, 'valid-token-123');
        });
    });

    describe('addTracksToPlaylist()', () => {
        it('ควรโยน Error "User not found" หากไม่พบผู้ใช้ในระบบ', async () => {
            mockUsersService.findById.mockResolvedValue(null);

            await expect(adapter.addTracksToPlaylist('unknown', 'pl-1', ['track-1'])).rejects.toThrow('User not found');
        });

        it('ควรแปลง Track ID เป็น Spotify URI และแอดเพลงเข้าเพลย์ลิสต์สำเร็จ', async () => {
            mockUsersService.findById.mockResolvedValue(mockUser);
            mockTokenService.getValidAccessToken.mockResolvedValue('valid-token-123');
            mockApiClient.addItemsToPlaylist.mockResolvedValue(true);

            const result = await adapter.addTracksToPlaylist(mockUser.id, 'pl-1', ['track-1', 'track-2']);

            expect(result).toBe(true);
            expect(mockApiClient.addItemsToPlaylist).toHaveBeenCalledWith(
                'pl-1',
                ['spotify:track:track-1', 'spotify:track:track-2'],
                'valid-token-123',
            );
        });
    });

    describe('getTracksMetadata()', () => {
        it('ควรโยน Error "User not found" หากไม่พบผู้ใช้ในระบบ', async () => {
            mockUsersService.findById.mockResolvedValue(null);

            await expect(adapter.getTracksMetadata('unknown', ['t1'])).rejects.toThrow('User not found');
        });

        it('ควรดึงและแปลง Metadata ของเพลง พร้อมจัดการ Fallbacks และคัดกรองแทร็กที่ null ออก', async () => {
            mockUsersService.findById.mockResolvedValue(mockUser);
            mockTokenService.getValidAccessToken.mockResolvedValue('valid-token-123');

            const mockSpotifyTracksResponse = [
                {
                    id: 'track-complete',
                    name: 'Complete Song',
                    album: {
                        name: 'Complete Album',
                        images: [{ url: 'https://cover.url/1.jpg' }],
                    },
                    artists: [{ name: 'Famous Artist' }],
                    duration_ms: 210000,
                    popularity: 80,
                },
                {
                    id: 'track-minimal',
                    // ทดสอบ fallback cases
                    album: null,
                    artists: null,
                },
                null, // ทดสอบ flatMap กรองแทร็กที่เป็น null
                { id: 123 }, // id ไม่ใช่ string -> กรองออก
            ];

            mockApiClient.fetchTracksMetadata.mockResolvedValue(mockSpotifyTracksResponse);

            const result = await adapter.getTracksMetadata(mockUser.id, ['track-complete', 'track-minimal']);

            expect(result).toHaveLength(2);

            expect(result[0]).toEqual({
                id: 'track-complete',
                title: 'Complete Song',
                artistName: 'Famous Artist',
                albumName: 'Complete Album',
                albumCoverUrl: 'https://cover.url/1.jpg',
                durationMs: 210000,
                popularity: 80,
            });

            expect(result[1]).toEqual({
                id: 'track-minimal',
                title: 'Unknown track',
                artistName: 'Unknown artist',
                albumName: null,
                albumCoverUrl: null,
                durationMs: 0,
                popularity: 0,
            });
        });
    });

    describe('searchTracks()', () => {
        it('ควรโยน Error "User not found" หากไม่พบผู้ใช้ในระบบ', async () => {
            mockUsersService.findById.mockResolvedValue(null);

            await expect(adapter.searchTracks('unknown', 'pop', 10)).rejects.toThrow('User not found');
        });

        it('ควรรองรับ Response กรณีคืนค่าเป็น Array ของแทร็กโดยตรง', async () => {
            mockUsersService.findById.mockResolvedValue(mockUser);
            mockTokenService.getValidAccessToken.mockResolvedValue('valid-token-123');

            const rawTracks = [
                {
                    id: 't1',
                    name: 'Direct Song',
                    artists: [{ name: 'Direct Artist' }],
                    album: { name: 'Direct Album', images: [{ url: 'https://img.url/1' }] },
                    duration_ms: 180000,
                    popularity: 50,
                },
            ];

            mockApiClient.searchTracks.mockResolvedValue(rawTracks);

            const result = await adapter.searchTracks(mockUser.id, 'direct', 10, 0);

            expect(result).toHaveLength(1);
            expect(result[0].id).toBe('t1');
            expect(result[0].title).toBe('Direct Song');
        });

        it('ควรรองรับ Response มาตรฐานของ Spotify Search API ({ tracks: { items: [...] } })', async () => {
            mockUsersService.findById.mockResolvedValue(mockUser);
            mockTokenService.getValidAccessToken.mockResolvedValue('valid-token-123');

            const searchResponse = {
                tracks: {
                    items: [
                        {
                            id: 't2',
                            name: 'Search Song',
                            artists: [{ name: 'Search Artist' }],
                            album: { name: 'Search Album', images: [{ url: 'https://img.url/2' }] },
                            duration_ms: 190000,
                            popularity: 65,
                        },
                    ],
                },
            };

            mockApiClient.searchTracks.mockResolvedValue(searchResponse);

            const result = await adapter.searchTracks(mockUser.id, 'search', 10, 5);

            expect(result).toHaveLength(1);
            expect(result[0].id).toBe('t2');
            expect(result[0].artistName).toBe('Search Artist');
            expect(mockApiClient.searchTracks).toHaveBeenCalledWith('search', 10, 'valid-token-123', 5);
        });

        it('ควรโยน Error เมื่อ Search Response ไม่อยู่ในรูปแบบที่รองรับ', async () => {
            mockUsersService.findById.mockResolvedValue(mockUser);
            mockTokenService.getValidAccessToken.mockResolvedValue('valid-token-123');

            mockApiClient.searchTracks.mockResolvedValue({ error: 'rate_limited' });

            await expect(adapter.searchTracks(mockUser.id, 'bad-response', 10)).rejects.toThrow(
                /Spotify search response did not contain tracks/,
            );
        });
    });
});
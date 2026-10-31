import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { SpotifyTokenService } from './spotify-token.service';
import { SpotifyAuthService } from './spotify-auth.service';
import { UsersService } from '../users/users.service';
import { RedisService } from '../redis/redis.service';

describe('SpotifyTokenService (TC-AUTH-02)', () => {
    let service: SpotifyTokenService;
    let mockSpotifyAuthService: any;
    let mockUsersService: any;
    let mockRedisClient: any;
    let mockRedisService: any;

    const mockUser = {
        id: 'user-uuid-1',
        spotifyId: 'spotify-user-123',
        accessToken: 'valid-access-token',
        refreshToken: 'valid-refresh-token',
        tokenExpiresAt: new Date(Date.now() + 1000 * 3600), // เหลือเวลาอีก 1 ชั่วโมง
    };

    beforeEach(async () => {
        mockRedisClient = {
            get: vi.fn(),
            set: vi.fn(),
        };

        mockRedisService = {
            getClient: vi.fn(() => mockRedisClient),
        };

        mockSpotifyAuthService = {
            refreshAccessToken: vi.fn(),
        };

        mockUsersService = {
            findById: vi.fn(),
            findBySpotifyId: vi.fn(),
            updateAccessToken: vi.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SpotifyTokenService,
                { provide: SpotifyAuthService, useValue: mockSpotifyAuthService },
                { provide: UsersService, useValue: mockUsersService },
                { provide: RedisService, useValue: mockRedisService },
            ],
        }).compile();

        service = module.get<SpotifyTokenService>(SpotifyTokenService);
    });

    describe('cacheAccessToken()', () => {
        it('ควรบันทึก Access Token และ Refresh Token ลง Redis พร้อมกำหนด TTL 55 นาที (3300s)', async () => {
            mockRedisClient.set.mockResolvedValue('OK');

            await service.cacheAccessToken('user-1', 'access-tok', 'refresh-tok', 3600);

            expect(mockRedisClient.set).toHaveBeenCalledWith(
                'user:token:user-1',
                expect.stringContaining('access-tok'),
                'EX',
                3300,
            );
        });
    });

    describe('refreshUserAccessToken()', () => {
        it('ควรโยน Error "User not found" หากไม่พบข้อมูลผู้ใช้ในระบบ', async () => {
            mockUsersService.findBySpotifyId.mockResolvedValue(null);

            await expect(service.refreshUserAccessToken('non-existent')).rejects.toThrow('User not found');
        });

        it('ควรเรียกต่ออายุ Token จาก SpotifyAuthService และอัปเดตลงทั้ง DB และ Redis', async () => {
            mockUsersService.findBySpotifyId.mockResolvedValue(mockUser);
            const tokenData = {
                access_token: 'new-refreshed-token',
                refresh_token: 'new-refreshed-refresh-token',
                expires_in: 3600,
            };
            mockSpotifyAuthService.refreshAccessToken.mockResolvedValue(tokenData);
            mockUsersService.updateAccessToken.mockResolvedValue(undefined);
            mockRedisClient.set.mockResolvedValue('OK');

            const result = await service.refreshUserAccessToken(mockUser.spotifyId);

            expect(mockSpotifyAuthService.refreshAccessToken).toHaveBeenCalledWith(mockUser.refreshToken);
            expect(mockUsersService.updateAccessToken).toHaveBeenCalledWith(
                mockUser.spotifyId,
                tokenData.access_token,
                expect.any(Date),
                tokenData.refresh_token,
            );
            expect(result).toEqual(tokenData);
            expect(mockRedisClient.set).toHaveBeenCalledWith(
                `user:token:${mockUser.id}`,
                expect.stringContaining('new-refreshed-token'),
                'EX',
                3300,
            );
        });
    });

    describe('getValidAccessToken()', () => {
        it('ควรคืนค่า Access Token จาก Redis Cache ทันทีหากพบข้อมูลในแคช (Cache Hit)', async () => {
            mockUsersService.findById.mockResolvedValue(mockUser);
            mockRedisClient.get.mockResolvedValue(JSON.stringify({ accessToken: 'cached-access-token' }));

            const token = await service.getValidAccessToken(mockUser.id);

            expect(token).toBe('cached-access-token');
            expect(mockSpotifyAuthService.refreshAccessToken).not.toHaveBeenCalled();
        });

        it('ควรโยน Error "User not found" หากไม่พบผู้ใช้ในระบบเมื่อเกิด Cache Miss', async () => {
            mockUsersService.findById.mockResolvedValue(null);

            await expect(service.getValidAccessToken('unknown-user')).rejects.toThrow('User not found');
        });

        it('ควรคืนค่า Token เดิมจาก DB และบันทึกลง Redis หาก Token ยังไม่หมดอายุ (เหลือเวลาเกิน Buffer 60s)', async () => {
            mockUsersService.findById.mockResolvedValue(mockUser);
            mockRedisClient.get.mockResolvedValue(null); // Cache Miss
            mockRedisClient.set.mockResolvedValue('OK');

            const token = await service.getValidAccessToken(mockUser.id);

            expect(token).toBe(mockUser.accessToken);
            expect(mockRedisClient.set).toHaveBeenCalledWith(
                `user:token:${mockUser.id}`,
                expect.stringContaining(mockUser.accessToken),
                'EX',
                3300,
            );
            expect(mockSpotifyAuthService.refreshAccessToken).not.toHaveBeenCalled();
        });

        it('ควรต่ออายุ Token อัตโนมัติหาก Token ใกล้หมดอายุ (เหลือเวลาน้อยกว่า Buffer 60 วินาที)', async () => {
            const expiringUser = {
                ...mockUser,
                tokenExpiresAt: new Date(Date.now() + 30_000), // เหลือเวลาเพียง 30 วินาที (< 60,000 ms)
            };
            mockUsersService.findById.mockResolvedValue(expiringUser);
            mockRedisClient.get.mockResolvedValue(null); // Cache Miss

            const refreshedData = {
                access_token: 'auto-refreshed-token',
                expires_in: 3600,
            };
            vi.spyOn(service, 'refreshUserAccessToken').mockResolvedValue(refreshedData as any);

            const token = await service.getValidAccessToken(expiringUser.id);

            expect(service.refreshUserAccessToken).toHaveBeenCalledWith(expiringUser.spotifyId);
            expect(token).toBe('auto-refreshed-token');
        });
    });
});
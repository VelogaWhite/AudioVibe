import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { SpotifyAuthService } from './spotify-auth.service';
import { RedisService } from '../redis/redis.service';

describe('SpotifyAuthService', () => {
    let service: SpotifyAuthService;
    let mockRedisClient: any;
    let mockRedisService: any;

    const originalEnv = process.env;

    beforeEach(async () => {
        process.env = {
            ...originalEnv,
            SPOTIFY_CLIENT_ID: 'test-client-id',
            SPOTIFY_CLIENT_SECRET: 'test-client-secret',
            SPOTIFY_REDIRECT_URI: 'http://localhost:3000/auth/spotify/callback',
        };

        mockRedisClient = {
            get: vi.fn(),
            set: vi.fn(),
            del: vi.fn(),
        };

        mockRedisService = {
            getClient: vi.fn(() => mockRedisClient),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SpotifyAuthService,
                {
                    provide: RedisService,
                    useValue: mockRedisService,
                },
            ],
        }).compile();

        service = module.get<SpotifyAuthService>(SpotifyAuthService);
    });

    afterEach(() => {
        process.env = originalEnv;
        vi.restoreAllMocks();
    });

    it('Service ควรถูกสร้างขึ้นมาได้อย่างถูกต้อง (Defined)', () => {
        expect(service).toBeDefined();
    });

    it('ควรจัดการกรณีไม่มีค่า Environment Variables โดยกำหนดเป็นค่าว่าง fallback', async () => {
        process.env = { ...originalEnv };
        delete process.env.SPOTIFY_CLIENT_ID;
        delete process.env.SPOTIFY_CLIENT_SECRET;
        delete process.env.SPOTIFY_REDIRECT_URI;

        const moduleFallback: TestingModule = await Test.createTestingModule({
            providers: [
                SpotifyAuthService,
                {
                    provide: RedisService,
                    useValue: mockRedisService,
                },
            ],
        }).compile();

        const fallbackService = moduleFallback.get<SpotifyAuthService>(SpotifyAuthService);
        expect(fallbackService).toBeDefined();
    });

    describe('getAuthorizationUrl()', () => {
        it('ควรสร้าง State 64 ตัวอักษร, บันทึกลง Redis พร้อม TTL 600 วินาที และคืน URL ที่ถูกต้อง', async () => {
            mockRedisClient.set.mockResolvedValue('OK');

            const urlString = await service.getAuthorizationUrl();
            const url = new URL(urlString);

            expect(url.origin + url.pathname).toBe('https://accounts.spotify.com/authorize');
            expect(url.searchParams.get('response_type')).toBe('code');
            expect(url.searchParams.get('client_id')).toBe('test-client-id');
            expect(url.searchParams.get('redirect_uri')).toBe('http://localhost:3000/auth/spotify/callback');
            expect(url.searchParams.get('show_dialog')).toBe('true');

            const state = url.searchParams.get('state');
            expect(state).toBeDefined();
            expect(state?.length).toBe(64); // 32 bytes in hex = 64 characters

            expect(mockRedisClient.set).toHaveBeenCalledWith(
                `oauth:spotify:state:${state}`,
                'valid',
                'EX',
                600,
            );
        });
    });

    describe('consumeAuthorizationState()', () => {
        it('ควรคืนค่า false ทันทีหาก state เป็นค่าว่าง หรือ undefined', async () => {
            expect(await service.consumeAuthorizationState('')).toBe(false);
            expect(await service.consumeAuthorizationState(null as any)).toBe(false);
            expect(mockRedisClient.get).not.toHaveBeenCalled();
        });

        it('ควรคืนค่า false หากไม่พบ State ใน Redis (State หมดอายุหรือไม่ถูกต้อง)', async () => {
            mockRedisClient.get.mockResolvedValue(null);

            const result = await service.consumeAuthorizationState('invalid-state-123');

            expect(result).toBe(false);
            expect(mockRedisClient.get).toHaveBeenCalledWith('oauth:spotify:state:invalid-state-123');
            expect(mockRedisClient.del).not.toHaveBeenCalled();
        });

        it('ควรคืนค่า true และลบ State ออกจาก Redis เมื่อ State ถูกต้อง (Single-use Validation)', async () => {
            mockRedisClient.get.mockResolvedValue('valid');
            mockRedisClient.del.mockResolvedValue(1);

            const result = await service.consumeAuthorizationState('valid-state-123');

            expect(result).toBe(true);
            expect(mockRedisClient.get).toHaveBeenCalledWith('oauth:spotify:state:valid-state-123');
            expect(mockRedisClient.del).toHaveBeenCalledWith('oauth:spotify:state:valid-state-123');
        });
    });

    describe('exchangeCodeForToken()', () => {
        it('ควรแลก Code เป็น Tokens สำเร็จเมื่อ Spotify ตอบกลับ 200 OK', async () => {
            const mockTokenResponse = {
                access_token: 'spotify-access-token-123',
                token_type: 'Bearer',
                scope: 'user-read-private user-read-email',
                expires_in: 3600,
                refresh_token: 'spotify-refresh-token-123',
            };

            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: async () => mockTokenResponse,
            });

            const result = await service.exchangeCodeForToken('valid-auth-code');

            expect(result).toEqual(mockTokenResponse);
            expect(global.fetch).toHaveBeenCalledWith(
                'https://accounts.spotify.com/api/token',
                expect.objectContaining({
                    method: 'POST',
                    headers: expect.objectContaining({
                        Authorization: expect.stringContaining('Basic '),
                        'Content-Type': 'application/x-www-form-urlencoded',
                    }),
                }),
            );
        });

        it('ควรโยน Error พร้อม Response Body เมื่อ Spotify ตอบกลับข้อผิดพลาด', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: false,
                status: 400,
                text: async () => '{"error":"invalid_grant","error_description":"Invalid authorization code"}',
            });

            await expect(service.exchangeCodeForToken('expired-code')).rejects.toThrow(
                'Spotify token exchange failed: 400 {"error":"invalid_grant","error_description":"Invalid authorization code"}',
            );
        });
    });

    describe('refreshAccessToken()', () => {
        it('ควรส่งคำขอรีเฟรช Token และคืนค่า Tokens ชุดใหม่สำเร็จ', async () => {
            const mockRefreshedTokens = {
                access_token: 'new-access-token-456',
                token_type: 'Bearer',
                scope: 'user-read-private',
                expires_in: 3600,
            };

            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: async () => mockRefreshedTokens,
            });

            const result = await service.refreshAccessToken('valid-refresh-token');

            expect(result).toEqual(mockRefreshedTokens);
            expect(global.fetch).toHaveBeenCalledWith(
                'https://accounts.spotify.com/api/token',
                expect.objectContaining({
                    method: 'POST',
                    headers: expect.objectContaining({
                        Authorization: expect.stringContaining('Basic '),
                        'Content-Type': 'application/x-www-form-urlencoded',
                    }),
                }),
            );
        });

        it('ควรโยน Error เมื่อการขอ Refresh Token ล้มเหลว', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: false,
                status: 401,
                text: async () => '{"error":"invalid_client"}',
            });

            await expect(service.refreshAccessToken('revoked-refresh-token')).rejects.toThrow(
                'Spotify token refresh failed: 401 {"error":"invalid_client"}',
            );
        });
    });

    describe('getCurrentUserProfile()', () => {
        it('ควรดึงข้อมูลโปรไฟล์ผู้ใช้สำเร็จเมื่อส่ง Bearer Token ที่ถูกต้อง', async () => {
            const mockProfile = {
                id: 'spotify-user-999',
                display_name: 'AudioVibe Tester',
                email: 'tester@audiovibe.com',
                images: [{ url: 'https://example.com/pic.jpg' }],
            };

            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: async () => mockProfile,
            });

            const result = await service.getCurrentUserProfile('valid-bearer-token');

            expect(result).toEqual(mockProfile);
            expect(global.fetch).toHaveBeenCalledWith(
                'https://api.spotify.com/v1/me',
                expect.objectContaining({
                    headers: {
                        Authorization: 'Bearer valid-bearer-token',
                    },
                }),
            );
        });

        it('ควรโยน Error เมื่อ Spotify คืนค่าความผิดพลาดของ Profile API', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: false,
                status: 401,
                text: async () => '{"error":{"status":401,"message":"The access token expired"}}',
            });

            await expect(service.getCurrentUserProfile('expired-token')).rejects.toThrow(
                'Spotify profile request failed: 401 {"error":{"status":401,"message":"The access token expired"}}',
            );
        });
    });
});
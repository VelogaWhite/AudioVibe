import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { SpotifyUserData } from './type/spotify-user-data.type';

describe('UsersService', () => {
    let service: UsersService;
    let mockPrisma: any;

    const mockUser = {
        id: 'user-uuid-123',
        spotifyId: 'spotify-test-user',
        email: 'test@audiovibe.com',
        displayName: 'Test User',
        profileImageUrl: 'https://example.com/avatar.jpg',
        accessToken: 'initial-access-token',
        refreshToken: 'initial-refresh-token',
        tokenExpiresAt: new Date(Date.now() + 3600 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const mockSpotifyData: SpotifyUserData = {
        spotifyId: 'spotify-test-user',
        email: 'test@audiovibe.com',
        displayName: 'Test User',
        profileImageUrl: 'https://example.com/avatar.jpg',
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        tokenExpiresAt: new Date(Date.now() + 3600 * 1000),
    };

    beforeEach(async () => {
        mockPrisma = {
            user: {
                findUnique: vi.fn(),
                create: vi.fn(),
                update: vi.fn(),
            },
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                {
                    provide: PrismaService,
                    useValue: mockPrisma,
                },
            ],
        }).compile();

        service = module.get<UsersService>(UsersService);
    });

    it('Service ควรถูกสร้างขึ้นมาได้อย่างถูกต้อง (Defined)', () => {
        expect(service).toBeDefined();
    });

    describe('findOrCreateUser()', () => {
        it('ควรอัปเดตข้อมูลผู้ใช้เดิมเมื่อพบ spotifyId ในระบบและมี refreshToken ใหม่', async () => {
            mockPrisma.user.findUnique.mockResolvedValue(mockUser);
            mockPrisma.user.update.mockResolvedValue({
                ...mockUser,
                ...mockSpotifyData,
            });

            const result = await service.findOrCreateUser(mockSpotifyData);

            expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
                where: { spotifyId: mockSpotifyData.spotifyId },
            });
            expect(mockPrisma.user.update).toHaveBeenCalledWith({
                where: { spotifyId: mockSpotifyData.spotifyId },
                data: {
                    email: mockSpotifyData.email,
                    displayName: mockSpotifyData.displayName,
                    profileImageUrl: mockSpotifyData.profileImageUrl,
                    accessToken: mockSpotifyData.accessToken,
                    refreshToken: mockSpotifyData.refreshToken,
                    tokenExpiresAt: mockSpotifyData.tokenExpiresAt,
                },
            });
            expect(result).toBeDefined();
        });

        it('ควรอัปเดตข้อมูลผู้ใช้เดิมได้แม้ไม่มี refreshToken ส่งมาด้วย', async () => {
            const dataWithoutRefresh: SpotifyUserData = {
                ...mockSpotifyData,
                refreshToken: undefined as any,
            };

            mockPrisma.user.findUnique.mockResolvedValue(mockUser);
            mockPrisma.user.update.mockResolvedValue(mockUser);

            await service.findOrCreateUser(dataWithoutRefresh);

            expect(mockPrisma.user.update).toHaveBeenCalledWith({
                where: { spotifyId: dataWithoutRefresh.spotifyId },
                data: {
                    email: dataWithoutRefresh.email,
                    displayName: dataWithoutRefresh.displayName,
                    profileImageUrl: dataWithoutRefresh.profileImageUrl,
                    accessToken: dataWithoutRefresh.accessToken,
                    tokenExpiresAt: dataWithoutRefresh.tokenExpiresAt,
                },
            });
        });

        it('ควรโยน Error หากเป็นผู้ใช้ใหม่แต่ Spotify ไม่ได้ส่ง refreshToken มาให้', async () => {
            const dataWithoutRefresh: SpotifyUserData = {
                ...mockSpotifyData,
                refreshToken: undefined as any,
            };

            mockPrisma.user.findUnique.mockResolvedValue(null);

            await expect(service.findOrCreateUser(dataWithoutRefresh)).rejects.toThrow(
                'Spotify did not provide refresh token for new user',
            );
            expect(mockPrisma.user.create).not.toHaveBeenCalled();
        });

        it('ควรสร้างผู้ใช้ใหม่ลงฐานข้อมูลเมื่อไม่พบผู้ใช้เดิมและมี refreshToken ครบถ้วน', async () => {
            mockPrisma.user.findUnique.mockResolvedValue(null);
            mockPrisma.user.create.mockResolvedValue(mockUser);

            const result = await service.findOrCreateUser(mockSpotifyData);

            expect(mockPrisma.user.create).toHaveBeenCalledWith({
                data: {
                    spotifyId: mockSpotifyData.spotifyId,
                    email: mockSpotifyData.email,
                    displayName: mockSpotifyData.displayName,
                    profileImageUrl: mockSpotifyData.profileImageUrl,
                    accessToken: mockSpotifyData.accessToken,
                    refreshToken: mockSpotifyData.refreshToken,
                    tokenExpiresAt: mockSpotifyData.tokenExpiresAt,
                },
            });
            expect(result).toEqual(mockUser);
        });
    });

    describe('findById()', () => {
        it('ควรคืนค่า User เมื่อค้นหาด้วย ID สำเร็จ', async () => {
            mockPrisma.user.findUnique.mockResolvedValue(mockUser);

            const result = await service.findById(mockUser.id);

            expect(result).toEqual(mockUser);
            expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
                where: { id: mockUser.id },
            });
        });

        it('ควรคืนค่า null เมื่อไม่พบข้อมูล User ตาม ID', async () => {
            mockPrisma.user.findUnique.mockResolvedValue(null);

            const result = await service.findById('non-exist-id');

            expect(result).toBeNull();
        });
    });

    describe('findBySpotifyId()', () => {
        it('ควรคืนค่า User เมื่อค้นหาด้วย Spotify ID สำเร็จ', async () => {
            mockPrisma.user.findUnique.mockResolvedValue(mockUser);

            const result = await service.findBySpotifyId(mockUser.spotifyId);

            expect(result).toEqual(mockUser);
            expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
                where: { spotifyId: mockUser.spotifyId },
            });
        });

        it('ควรคืนค่า null เมื่อไม่พบข้อมูล User ด้วย Spotify ID', async () => {
            mockPrisma.user.findUnique.mockResolvedValue(null);

            const result = await service.findBySpotifyId('unknown-spotify-id');

            expect(result).toBeNull();
        });
    });

    describe('updateAccessToken()', () => {
        it('ควรอัปเดตทั้ง accessToken, tokenExpiresAt และ refreshToken เมื่อระบุครบ', async () => {
            const newExpiry = new Date(Date.now() + 7200 * 1000);
            mockPrisma.user.update.mockResolvedValue({
                ...mockUser,
                accessToken: 'new-token',
                tokenExpiresAt: newExpiry,
                refreshToken: 'updated-refresh-token',
            });

            await service.updateAccessToken(
                mockUser.spotifyId,
                'new-token',
                newExpiry,
                'updated-refresh-token',
            );

            expect(mockPrisma.user.update).toHaveBeenCalledWith({
                where: { spotifyId: mockUser.spotifyId },
                data: {
                    accessToken: 'new-token',
                    tokenExpiresAt: newExpiry,
                    refreshToken: 'updated-refresh-token',
                },
            });
        });

        it('ควรอัปเดตเฉพาะ accessToken และ tokenExpiresAt เมื่อไม่ส่ง refreshToken', async () => {
            const newExpiry = new Date(Date.now() + 7200 * 1000);
            mockPrisma.user.update.mockResolvedValue(mockUser);

            await service.updateAccessToken(
                mockUser.spotifyId,
                'new-token',
                newExpiry,
            );

            expect(mockPrisma.user.update).toHaveBeenCalledWith({
                where: { spotifyId: mockUser.spotifyId },
                data: {
                    accessToken: 'new-token',
                    tokenExpiresAt: newExpiry,
                },
            });
        });
    });
});
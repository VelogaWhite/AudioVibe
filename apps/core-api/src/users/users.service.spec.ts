import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';

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

    beforeEach(async () => {
        mockPrisma = {
            user: {
                findUnique: vi.fn(),
                create: vi.fn(),
                update: vi.fn(),
                delete: vi.fn(),
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

    it('Service ควรถูก Instantiate สำเร็จ (Defined)', () => {
        expect(service).toBeDefined();
    });

    describe('findById()', () => {
        it('ควรคืนค่า User เมื่อพบข้อมูลตาม ID', async () => {
            mockPrisma.user.findUnique.mockResolvedValue(mockUser);

            const result = await service.findById(mockUser.id);

            expect(result).toEqual(mockUser);
            expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
                where: { id: mockUser.id },
            });
        });

        it('ควรคืนค่า null เมื่อไม่พบข้อมูล User', async () => {
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
    });

    describe('updateAccessToken()', () => {
        it('ควรเรียก update ข้อมูล Token ใหม่ลงฐานข้อมูลถูกต้อง', async () => {
            const newExpiry = new Date(Date.now() + 7200 * 1000);
            mockPrisma.user.update.mockResolvedValue({
                ...mockUser,
                accessToken: 'new-access-token',
                tokenExpiresAt: newExpiry,
            });

            await service.updateAccessToken(
                mockUser.spotifyId,
                'new-access-token',
                newExpiry,
                'new-refresh-token',
            );

            expect(mockPrisma.user.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { spotifyId: mockUser.spotifyId },
                    data: expect.objectContaining({
                        accessToken: 'new-access-token',
                        tokenExpiresAt: newExpiry,
                        refreshToken: 'new-refresh-token',
                    }),
                }),
            );
        });
    });
});
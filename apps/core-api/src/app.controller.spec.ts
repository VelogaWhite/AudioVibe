import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { ServiceUnavailableException } from '@nestjs/common';
import { AppController } from './app.controller';
import { PrismaService } from './prisma/prisma.service';
import { RedisService } from './redis/redis.service';

describe('AppController', () => {
  let controller: AppController;
  let mockPrisma: any;
  let mockRedisClient: any;
  let mockRedisService: any;

  beforeEach(async () => {
    mockPrisma = {
      $queryRaw: vi.fn(),
    };

    mockRedisClient = {
      ping: vi.fn(),
    };

    mockRedisService = {
      getClient: vi.fn(() => mockRedisClient),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        { provide: PrismaService, useValue: mockPrisma },
        { provide: RedisService, useValue: mockRedisService },
      ],
    }).compile();

    controller = module.get<AppController>(AppController);
  });

  it('Controller ควรถูกสร้างขึ้นมาได้อย่างถูกต้อง (Defined)', () => {
    expect(controller).toBeDefined();
  });

  describe('getHello()', () => {
    it('ควรคืนค่าข้อความ "Hello World!"', () => {
      expect(controller.getHello()).toBe('Hello World!');
    });
  });

  describe('health()', () => {
    it('ควรคืนค่า status "ok" เมื่อทั้ง PostgreSQL และ Redis ทำงานปกติ', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([{ 1: 1 }]);
      mockRedisClient.ping.mockResolvedValue('PONG');

      const result = await controller.health();

      expect(result).toEqual({
        status: 'ok',
        checks: {
          postgres: true,
          redis: true,
        },
      });
      expect(mockPrisma.$queryRaw).toHaveBeenCalled();
      expect(mockRedisClient.ping).toHaveBeenCalled();
    });

    it('ควรโยน ServiceUnavailableException เมื่อ PostgreSQL ทำงานล้มเหลว', async () => {
      mockPrisma.$queryRaw.mockRejectedValue(new Error('DB Connection Timeout'));
      mockRedisClient.ping.mockResolvedValue('PONG');

      await expect(controller.health()).rejects.toThrow(ServiceUnavailableException);

      try {
        await controller.health();
      } catch (err: any) {
        expect(err.getResponse()).toEqual({
          status: 'degraded',
          checks: { postgres: false, redis: true },
        });
      }
    });

    it('ควรโยน ServiceUnavailableException เมื่อ Redis ทำงานล้มเหลว (Exception)', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([{ 1: 1 }]);
      mockRedisClient.ping.mockRejectedValue(new Error('Redis Connection Refused'));

      await expect(controller.health()).rejects.toThrow(ServiceUnavailableException);

      try {
        await controller.health();
      } catch (err: any) {
        expect(err.getResponse()).toEqual({
          status: 'degraded',
          checks: { postgres: true, redis: false },
        });
      }
    });

    it('ควรโยน ServiceUnavailableException เมื่อ Redis ping คืนค่าที่ไม่ใช่ PONG', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([{ 1: 1 }]);
      mockRedisClient.ping.mockResolvedValue('FAILED');

      await expect(controller.health()).rejects.toThrow(ServiceUnavailableException);

      try {
        await controller.health();
      } catch (err: any) {
        expect(err.getResponse()).toEqual({
          status: 'degraded',
          checks: { postgres: true, redis: false },
        });
      }
    });

    it('ควรโยน ServiceUnavailableException เมื่อทั้ง PostgreSQL และ Redis ล้มเหลวพร้อมกัน', async () => {
      mockPrisma.$queryRaw.mockRejectedValue(new Error('Database Down'));
      mockRedisClient.ping.mockRejectedValue(new Error('Redis Down'));

      await expect(controller.health()).rejects.toThrow(ServiceUnavailableException);

      try {
        await controller.health();
      } catch (err: any) {
        expect(err.getResponse()).toEqual({
          status: 'degraded',
          checks: { postgres: false, redis: false },
        });
      }
    });
  });
});
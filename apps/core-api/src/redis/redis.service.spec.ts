import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { RedisService } from './redis.service';

// Mock ioredis ด้วย Class เพื่อให้รองรับคำสั่ง new Redis(...) ได้ 100%
vi.mock('ioredis', () => {
    class RedisMock {
        get = vi.fn();
        set = vi.fn();
        del = vi.fn();
        quit = vi.fn().mockResolvedValue('OK');
        on = vi.fn();
    }

    return {
        default: RedisMock,
        Redis: RedisMock,
    };
});

describe('RedisService (TC-EDGE-02)', () => {
    let service: RedisService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [RedisService],
        }).compile();

        service = module.get<RedisService>(RedisService);
    });

    it('Service ควรถูกสร้างขึ้นมาได้อย่างถูกต้อง (Defined)', () => {
        expect(service).toBeDefined();
    });

    it('ควรจัดการวงจร Lifecycle ได้โดยไม่ Crash', () => {
        if (typeof (service as any).onModuleInit === 'function') {
            expect(() => (service as any).onModuleInit()).not.toThrow();
        }

        if (typeof (service as any).getClient === 'function') {
            const client = (service as any).getClient();
            expect(client).toBeDefined();
        }
    });
});
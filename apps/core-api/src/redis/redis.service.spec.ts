import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { RedisService } from './redis.service';

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
        // ทดสอบฟังก์ชัน Lifecycle พื้นฐานของ Redis Module
        if (typeof (service as any).onModuleInit === 'function') {
            expect(() => (service as any).onModuleInit()).not.toThrow();
        }

        if (typeof (service as any).getClient === 'function') {
            const client = (service as any).getClient();
            expect(client).toBeDefined();
        }
    });
});
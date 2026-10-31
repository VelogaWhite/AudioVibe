import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';

// Mock ด้วย Class เพื่อรองรับ new PrismaPg(...) ได้ 100%
vi.mock('@prisma/adapter-pg', () => {
    class PrismaPg {
        constructor(public options?: any) { }
    }
    return { PrismaPg };
});

// Mock PrismaClient แม่แบบด้วย Class
vi.mock('../generated/prisma/client.js', () => {
    class PrismaClient {
        constructor(_options?: any) { }
        $connect = vi.fn().mockResolvedValue(undefined);
        $disconnect = vi.fn().mockResolvedValue(undefined);
    }
    return { PrismaClient };
});

describe('PrismaService', () => {
    let service: PrismaService;

    beforeEach(async () => {
        process.env.DATABASE_URL = 'postgresql://mock:mock@localhost:5432/mock_db';

        const module: TestingModule = await Test.createTestingModule({
            providers: [PrismaService],
        }).compile();

        service = module.get<PrismaService>(PrismaService);
    });

    it('Service ควรถูกสร้างขึ้นมาได้อย่างถูกต้อง (Defined)', () => {
        expect(service).toBeDefined();
    });

    it('onModuleInit() ควรเรียกคำสั่ง $connect() เพื่อเปิดการเชื่อมต่อ', async () => {
        await service.onModuleInit();
        expect(service.$connect).toHaveBeenCalled();
    });

    it('onModuleDestroy() ควรเรียกคำสั่ง $disconnect() เพื่อปิดการเชื่อมต่อ', async () => {
        await service.onModuleDestroy();
        expect(service.$disconnect).toHaveBeenCalled();
    });
});
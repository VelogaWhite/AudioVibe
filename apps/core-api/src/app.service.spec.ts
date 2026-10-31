import { describe, it, expect, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';

describe('AppService', () => {
    let service: AppService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [AppService],
        }).compile();

        service = module.get<AppService>(AppService);
    });

    it('Service ควรถูกสร้างขึ้นมาได้อย่างถูกต้อง (Defined)', () => {
        expect(service).toBeDefined();
    });

    it('getHello() ควรคืนค่า "Hello World!"', () => {
        expect(service.getHello()).toBe('Hello World!');
    });
});
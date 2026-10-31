import { Module } from '@nestjs/common';
import { PromptLogController } from './prompt-log.controller.js';
import { PromptLogService } from './prompt-log.service.js';

@Module({
  controllers: [PromptLogController],
  providers: [PromptLogService],
})
export class PromptLogModule {}

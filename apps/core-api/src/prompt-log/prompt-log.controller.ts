import { BadRequestException, Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CreatePromptLogRequestDTO } from '../dto/create-prompt-log-request.dto.js';
import { PromptLogService } from './prompt-log.service.js';

@Controller('prompt-logs')
export class PromptLogController {
  constructor(private readonly promptLogService: PromptLogService) {}

  @Post()
  create(@Body() request: CreatePromptLogRequestDTO) {
    return this.promptLogService.create(request);
  }

  @Get()
  list(@Query('userId') userId: string) {
    if (!userId) throw new BadRequestException('userId is required');
    return this.promptLogService.list(userId);
  }
}

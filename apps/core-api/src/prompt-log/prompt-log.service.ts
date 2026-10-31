import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreatePromptLogRequestDTO } from '../dto/create-prompt-log-request.dto.js';

@Injectable()
export class PromptLogService {
  constructor(private readonly prisma: PrismaService) {}

  async create(request: CreatePromptLogRequestDTO) {
    const user = await this.prisma.user.findUnique({
      where: { id: request.userId },
      select: { id: true },
    });
    if (!user) throw new NotFoundException('User not found');

    return this.prisma.promptLog.create({
      data: {
        userId: request.userId,
        rawPrompt: request.rawPrompt,
        isPreset: request.isPreset ?? false,
        presetName: request.presetName,
        targetDanceability: request.targetDanceability,
        targetValence: request.targetValence,
        targetEnergy: request.targetEnergy,
        targetAcousticness: request.targetAcousticness,
        targetInstrumentalness: request.targetInstrumentalness,
        targetLiveness: request.targetLiveness,
        targetSpeechiness: request.targetSpeechiness,
      },
    });
  }

  async list(userId: string) {
    return this.prisma.promptLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}

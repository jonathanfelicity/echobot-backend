import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class CounterService {
  constructor(private readonly prisma: PrismaService) {}

  async getCurrentCount(entity: string): Promise<number> {
    const counter = await this.prisma.counter.findUnique({
      where: { entity },
    });
    return counter ? counter.count : 0;
  }

  async incrementCount(entity: string, incrementBy: number = 1): Promise<void> {
    await this.prisma.counter.upsert({
      where: { entity },
      update: { count: { increment: incrementBy } },
      create: { entity, count: incrementBy },
    });
  }
}

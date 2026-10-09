
import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) { }

  async create(
    createEventDto: CreateEventDto,
    organizationId: string,
  ) {
    return this.prisma.event.create({
      data: {
        type: createEventDto.type,
        source: createEventDto.source,
        severity: createEventDto.severity,
        message: createEventDto.message,
        metadata: createEventDto.metadata as
          | object
          | undefined,
        organizationId,
      },
    });
  }

  async findAll(organizationId: string) {
    return this.prisma.event.findMany({
      where: {
        organizationId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(
    eventId: string,
    organizationId: string,
  ) {
    const event = await this.prisma.event.findFirst({
      where: {
        id: eventId,
        organizationId,
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return event;
  }
}


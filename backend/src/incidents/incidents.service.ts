
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateIncidentStatusDto } from './dto/update-incident-status.dto';
import { IncidentStatus, EventSeverity } from '../generated/prisma/client';


@Injectable()
export class IncidentsService {
  constructor(private readonly prisma: PrismaService) { }


async createPaymentIncident(
  organizationId: string,
  totalPayments: number,
  failedPayments: number,
  failureRate: number,
) {
  // Check whether this organization already has an open
  // payment failure incident.
  const existingIncident = await this.prisma.incident.findFirst({
    where: {
      organizationId,
      title: 'Payment Failure Spike',
      status: {
        in: ['OPEN', 'INVESTIGATING'],
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Reuse the existing incident instead of creating a duplicate.
  if (existingIncident) {
    return existingIncident;
  }

  // Create a new incident only if no active one exists.
  return this.prisma.incident.create({
    data: {
      title: 'Payment Failure Spike',
      description: `Payment failure rate reached ${failureRate}% (${failedPayments} failures out of ${totalPayments} payments in the last 5 minutes).`,
      severity: 'HIGH',
      status: 'OPEN',
      organizationId,
      totalPayments,
      failedPayments,
      failureRate,
    },
  });
}


  async findAll(organizationId: string) {
    return this.prisma.incident.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(incidentId: string, organizationId: string) {
    const incident = await this.prisma.incident.findFirst({
      where: { id: incidentId, organizationId },
    });

    if (!incident) {
      throw new NotFoundException('Incident not found');
    }

    return incident;
  }


async updateStatus(
  incidentId: string,
  organizationId: string,
  dto: UpdateIncidentStatusDto,
) {
  const incident = await this.prisma.incident.findFirst({
    where: {
      id: incidentId,
      organizationId,
    },
  });

  if (!incident) {
    throw new NotFoundException('Incident not found');
  }

  return this.prisma.incident.update({
    where: { id: incident.id },
    data: {
      status: dto.status,
    },
  });
}

}

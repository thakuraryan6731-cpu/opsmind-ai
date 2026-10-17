
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateIncidentStatusDto } from './dto/update-incident-status.dto';
import { IncidentStatus, EventSeverity } from '../generated/prisma/client';
import { Prisma } from '../generated/prisma/client';


@Injectable()
export class IncidentsService {
  constructor(private readonly prisma: PrismaService) { }




  async createPaymentIncident(
    organizationId: string,
    totalPayments: number,
    failedPayments: number,
    failureRate: number,
  ) {
    const fingerprint = 'payment-failure-spike';

    const findActiveIncident = () =>
      this.prisma.incident.findFirst({
        where: {
          organizationId,
          fingerprint,
          status: { in: ['OPEN', 'INVESTIGATING'] },
        },
        orderBy: { createdAt: 'desc' },
      });

    const existingIncident = await findActiveIncident();

    if (existingIncident) {
      return existingIncident;
    }

    try {
      return await this.prisma.incident.create({
        data: {
          title: 'Payment Failure Spike',
          description: `Payment failure rate reached ${failureRate}% (${failedPayments} failures out of ${totalPayments} payments in the last 5 minutes).`,
          fingerprint,
          severity: 'HIGH',
          status: 'OPEN',
          organizationId,
          totalPayments,
          failedPayments,
          failureRate,
        },
      });
    } catch (error) {
      // Another request may have created the same active incident.
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        const activeIncident = await findActiveIncident();

        if (activeIncident) {
          return activeIncident;
        }
      }

      throw error;
    }
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


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


  async investigate(
    incidentId: string,
    organizationId: string,
  ) {
    const incident = await this.findOne(
      incidentId,
      organizationId,
    );


    const windowStart = new Date(
      Date.now() - 15 * 60 * 1000,
    );

    const incidentWindowStart = new Date(
      incident.createdAt.getTime() - 5 * 60 * 1000,
    );

    const incidentWindowEnd = new Date(
      incident.createdAt.getTime() + 5 * 60 * 1000,
    );

    const events = await this.prisma.event.findMany({
      where: {
        organizationId,
        OR: [
          {
            createdAt: {
              gte: windowStart,
            },
            OR: [
              { type: { startsWith: 'payment.' } },
              { severity: { in: ['HIGH', 'CRITICAL'] } },
            ],
          },
          {
            createdAt: {
              gte: incidentWindowStart,
              lte: incidentWindowEnd,
            },
            OR: [
              { type: { startsWith: 'payment.' } },
              { severity: { in: ['HIGH', 'CRITICAL'] } },
            ],
          },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 500,
    });


    const failedEvents = events.filter(
      (event) =>
        event.type === 'payment.failed',
    );

    const successEvents = events.filter(
      (event) =>
        event.type === 'payment.success',
    );

    const evidence = {
      incidentTotalPayments: incident.totalPayments,
      incidentFailedPayments: incident.failedPayments,
      incidentFailureRate: incident.failureRate,
      recentFailedEvents: failedEvents.length,
      recentSuccessfulEvents: successEvents.length,
    };

    const errorCounts = new Map<string, number>();

    for (const event of failedEvents) {
      const key = `${event.source}: ${event.message}`;
      errorCounts.set(
        key,
        (errorCounts.get(key) ?? 0) + 1,
      );
    }

    const recurringErrors = Array.from(
      errorCounts.entries(),
    )
      .map(([pattern, count]) => ({
        pattern,
        count,
      }))
      .sort((a, b) => b.count - a.count);

    const suspectedCauses: string[] = [];

    if (failedEvents.length > 0) {
      suspectedCauses.push(
        'Payment failures occurred during the investigation window. Inspect the recurring errors and their sources.',
      );
    }

    if (recurringErrors.length > 0) {
      suspectedCauses.push(
        'Repeated failure messages may indicate a shared issue with a payment source or dependency.',
      );
    }

    if (failedEvents.length === 0) {
      suspectedCauses.push(
        'No payment.failed events were found in the last 15 minutes. The incident may predate this window or the relevant events may not be recorded.',
      );
    }

    const recommendations: string[] = [];

    if (recurringErrors.length > 0) {
      recommendations.push(
        'Inspect the most frequent failure message and its source first.',
      );
    }

    recommendations.push(
      'Check payment gateway health, timeout rates, and recent deployments before confirming a root cause.',
    );

    return {
      incident: {
        id: incident.id,
        title: incident.title,
        status: incident.status,
        severity: incident.severity,
      },
      investigation: {
        generatedAt: new Date().toISOString(),
        windowMinutes: 15,
        eventsExamined: events.length,
        failedPayments: failedEvents.length,
        successfulPayments: successEvents.length,
        evidence,
        recurringErrors,
        suspectedCauses,
        recommendations,
        confidence:
          failedEvents.length > 0
            ? 'Preliminary — requires verification'
            : 'Insufficient recent evidence',
      },
    };
  }


}

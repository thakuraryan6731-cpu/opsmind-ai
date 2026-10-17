
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IncidentsService } from '../incidents/incidents.service';

@Injectable()
export class DetectionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly incidentsService: IncidentsService,
  ) { }

  async detectPaymentFailures(organizationId: string) {
    const windowStart = new Date(Date.now() - 5 * 60 * 1000);

    const events = await this.prisma.event.findMany({
      where: {
        organizationId,
        type: { in: ['payment.success', 'payment.failed'] },
        createdAt: { gte: windowStart },
      },
      select: { type: true },
    });

    const totalPayments = events.length;
    const failedPayments = events.filter(
      (event) => event.type === 'payment.failed',
    ).length;

    const failureRate =
      totalPayments === 0
        ? 0
        : (failedPayments / totalPayments) * 100;

    const minimumEvents = 20;
    const failureThreshold = 10;

    const anomalyDetected =
      totalPayments >= minimumEvents &&
      failureRate > failureThreshold;

    let incident = null;

    if (anomalyDetected) {
      incident = await this.incidentsService.createPaymentIncident(
        organizationId,
        totalPayments,
        failedPayments,
        Number(failureRate.toFixed(2)),
      );
    }

    return {
      windowMinutes: 5,
      totalPayments,
      failedPayments,
      failureRate: Number(failureRate.toFixed(2)),
      minimumEvents,
      failureThresholdPercent: failureThreshold,
      anomalyDetected,
      incident,
      message: anomalyDetected
        ? 'Payment failure anomaly detected. Incident created.'
        : 'No payment anomaly detected.',
    };
  }
}

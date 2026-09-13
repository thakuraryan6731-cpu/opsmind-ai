import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrganizationsService {
  constructor(private readonly prisma: PrismaService) { }

  async findAll(organizationId: string) {
    return this.prisma.organization.findMany({
      where: {
        id: organizationId,
      },
    });
  }

  async create(name: string) {
    return this.prisma.organization.create({
      data: {
        name,
      },
    });
  }
}

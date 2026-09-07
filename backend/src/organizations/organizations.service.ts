import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrganizationsService {
  constructor(private readonly prisma: PrismaService) { }

  async findAll() {
    return this.prisma.organization.findMany();
  }

  async create(name: string) {
    return this.prisma.organization.create({
      data: {
        name,
      },
    });
  }
}

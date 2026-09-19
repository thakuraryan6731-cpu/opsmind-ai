import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRole } from '../generated/prisma/client';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) { }

  async findAll() {
    const users = await this.prisma.user.findMany({
      include: {
        organization: true,
      },
    });

    return users.map(({ passwordHash, ...user }) => user);
  }

  async create(
    createUserDto: CreateUserDto,
    organizationId: string,
  ) {
    const passwordHash = await bcrypt.hash(createUserDto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email: createUserDto.email,
        name: createUserDto.name,
        passwordHash,
        organizationId,
      },
    });

    const { passwordHash: _, ...safeUser } = user;

    return safeUser;
  }

  async findOne(userId: string, organizationId: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        organizationId,
      },
      include: {
        organization: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { passwordHash, ...safeUser } = user;

    return safeUser;
  }

  async updateRole(
    userId: string,
    organizationId: string,
    updateUserRoleDto: UpdateUserRoleDto,
  ) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        organizationId,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        role: updateUserRoleDto.role,
      },
    });

    const { passwordHash: _, ...safeUser } = updatedUser;

    return safeUser;
  }
}

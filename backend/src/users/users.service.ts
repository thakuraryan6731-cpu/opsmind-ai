import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

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

  async create(createUserDto: CreateUserDto) {
    const passwordHash = await bcrypt.hash(createUserDto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email: createUserDto.email,
        name: createUserDto.name,
        passwordHash,
        organizationId: createUserDto.organizationId,
      },
    });

    const { passwordHash: _, ...safeUser } = user;

    return safeUser;
  }
}

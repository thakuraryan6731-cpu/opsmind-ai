import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [PrismaModule, OrganizationsModule, UsersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

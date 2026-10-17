import { Module } from '@nestjs/common';
import { DetectionController } from './detection.controller';
import { DetectionService } from './detection.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { PassportModule } from '@nestjs/passport';
import { IncidentsModule } from '../incidents/incidents.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    IncidentsModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [DetectionController],
  providers: [DetectionService],
})
export class DetectionModule { }

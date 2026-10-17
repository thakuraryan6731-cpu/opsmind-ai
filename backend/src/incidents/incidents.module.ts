
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { IncidentsController } from './incidents.controller';
import { IncidentsService } from './incidents.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [IncidentsController],
  providers: [IncidentsService],
  exports: [IncidentsService],
})
export class IncidentsModule { }

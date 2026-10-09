
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),
  ],
  controllers: [EventsController],
  providers: [EventsService],
})
export class EventsModule { }

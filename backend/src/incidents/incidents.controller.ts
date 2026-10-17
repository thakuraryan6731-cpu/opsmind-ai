import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';

import { IncidentsService } from './incidents.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UpdateIncidentStatusDto } from './dto/update-incident-status.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../generated/prisma/client';
import { Post } from '@nestjs/common';

@Controller('incidents')
@UseGuards(JwtAuthGuard)
export class IncidentsController {
  constructor(
    private readonly incidentsService: IncidentsService,
  ) { }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.incidentsService.findAll(user.organizationId);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.incidentsService.findOne(
      id,
      user.organizationId,
    );
  }
  @Patch(':id/status')
  @Roles(UserRole.ADMIN, UserRole.OPERATIONS_MANAGER)
  @UseGuards(RolesGuard)
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateIncidentStatusDto,
    @CurrentUser() user: any,
  ) {
    return this.incidentsService.updateStatus(
      id,
      user.organizationId,
      dto,
    );
  }

  @Post(':id/investigate')
  investigate(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.incidentsService.investigate(
      id,
      user.organizationId,
    );
  }
}

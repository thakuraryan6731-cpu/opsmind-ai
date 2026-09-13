import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';

import { OrganizationsService } from './organizations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('organizations')
@UseGuards(JwtAuthGuard)
export class OrganizationsController {
  constructor(
    private readonly organizationsService: OrganizationsService,
  ) { }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.organizationsService.findAll(user.organizationId);
  }

  @Post()
  create(@Body() body: { name: string }) {
    return this.organizationsService.create(body.name);
  }
}

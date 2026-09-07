import { Body, Controller, Get, Post } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';

@Controller('organizations')
export class OrganizationsController {
  constructor(
    private readonly organizationsService: OrganizationsService,
  ) { }

  @Get()
  findAll() {
    return this.organizationsService.findAll();
  }

  @Post()
  create(@Body() body: { name: string }) {
    return this.organizationsService.create(body.name);
  }
}

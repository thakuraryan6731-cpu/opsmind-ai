import { IsEnum } from 'class-validator';
import { IncidentStatus } from '../../generated/prisma/client';

export class UpdateIncidentStatusDto {
  @IsEnum(IncidentStatus)
  status: IncidentStatus;
}

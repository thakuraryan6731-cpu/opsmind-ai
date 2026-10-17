
import {
  Controller,
  Post,
  UseGuards,
} from '@nestjs/common';

import { DetectionService } from './detection.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('detection')
@UseGuards(JwtAuthGuard)
export class DetectionController {
  constructor(
    private readonly detectionService: DetectionService,
  ) { }

  @Post('run')
  runDetection(@CurrentUser() user: any) {
    return this.detectionService.detectPaymentFailures(
      user.organizationId,
    );
  }
}

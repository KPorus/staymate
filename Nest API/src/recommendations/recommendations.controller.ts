import { Controller, Get, Param } from '@nestjs/common';
import { RecommendationsService } from './recommendations.service';

@Controller('recommendations')
export class RecommendationsController {
  constructor(private recService: RecommendationsService) {}

  @Get(':userId')
  async get(@Param('userId') userId: string): Promise<any> {
    return this.recService.recommendFor(userId, 5);
  }
}

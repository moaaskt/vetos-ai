import {
  Controller,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { WeightRecordsService } from './weight-records.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { CreateWeightRecordDto } from './dto/create-weight-record.dto';

@UseGuards(JwtAuthGuard)
@Controller('weight-records')
export class WeightRecordsController {
  constructor(private readonly weightRecordsService: WeightRecordsService) {}

  @Post()
  create(
    @CurrentUser() user: any,
    @Body() createWeightRecordDto: CreateWeightRecordDto,
  ) {
    return this.weightRecordsService.create(
      user.clinicId,
      createWeightRecordDto,
    );
  }

  @Delete(':id')
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.weightRecordsService.remove(user.clinicId, id);
  }
}

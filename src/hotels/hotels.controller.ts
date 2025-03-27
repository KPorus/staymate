import {
  Controller,
  FileTypeValidator,
  Get,
  HttpCode,
  Param,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtGuard } from 'src/auth/guard';
import { HotelsService } from './hotels.service';
import { Hotels } from 'src/schema/hotels';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdminGuard } from 'src/auth/guard/admin.guard';

@Controller('hotels')
@UseGuards(JwtGuard)
export class HotelsController {
  constructor(private readonly HotelsService: HotelsService) {}

  @Get()
  getAllProjects() {
    return this.HotelsService.allhotels();
  }
  @HttpCode(200)
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(AdminGuard)
  @Post('create')
  createProject(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new FileTypeValidator({ fileType: 'image/jpeg' })],
      }),
    )
    file: Express.Multer.File,
    project: Hotels,
  ) {
    return this.HotelsService.addHotels(file, project);
  }

  @HttpCode(200)
  @Get(':id')
  hotelDetails(@Param('id') id: string) {
    // console.log(id);
    return this.HotelsService.getHotelById(id);
  }
}

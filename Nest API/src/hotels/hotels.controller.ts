import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  HttpCode,
  Param,
  ParseFilePipe,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtGuard } from 'src/auth/guard';
import { HotelsService } from './hotels.service';
// import { Hotels } from 'src/schema/hotels';
import { CreateHotelDto, UpdateHotelDto } from './dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdminGuard } from 'src/auth/guard/admin.guard';
import { GetUser } from 'src/auth/decorator';
import { ParseGeoCoordinatesPipe } from './dto/pipe';
import { ManagerGuard } from 'src/auth/guard/manager.guard';
import { CommonGuard } from 'src/auth/guard/common.guard';

@Controller('hotels')
@UseGuards(JwtGuard)
export class HotelsController {
  constructor(private readonly HotelsService: HotelsService) {}

  @Get()
  @UseGuards(AdminGuard)
  getAllProjects() {
    return this.HotelsService.allhotels();
  }

  @Get('nearby')
  async getNearbyHotels(@Query('lat') lat: string, @Query('lng') lng: string) {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    return this.HotelsService.findNearbyHotels(latitude, longitude);
  }

  @HttpCode(200)
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(ManagerGuard)
  @Post('create')
  createProject(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new FileTypeValidator({ fileType: 'image/jpeg' })],
      }),
    )
    file: Express.Multer.File,
    @Body(ParseGeoCoordinatesPipe) project: CreateHotelDto,
    @GetUser() user,
  ) {
    project.userId = user._id;
    return this.HotelsService.addHotels(file, project);
  }

  @HttpCode(200)
  @Get(':id')
  hotelDetails(@Param('id') id: string) {
    // console.log(id);
    return this.HotelsService.getHotelById(id);
  }
  @HttpCode(200)
  @Put('/update/:id')
  @UseGuards(ManagerGuard)
  updateHotelInfo(
    @Param('id') id: string,
    @Body() dto: UpdateHotelDto,
    @GetUser() user: any,
  ) {
    // console.log(id, dto);
    return this.HotelsService.updateHotelById(id, dto, user._id);
  }
  @HttpCode(200)
  @Put('/delete/:id')
  @UseGuards(CommonGuard)
  deleteHotel(@Param('id') id: string) {
    return this.HotelsService.deleteHotelById(id);
  }
}

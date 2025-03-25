import {
  Controller,
  FileTypeValidator,
  Get,
  HttpCode,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtGuard } from 'src/auth/guard';
import { ProjectsService } from './projects.service';
import { Projects } from 'src/schema/project';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('projects')
@UseGuards(JwtGuard)
export class ProjectsController {
  constructor(private readonly ProjectsService: ProjectsService) {}

  @Get()
  getAllProjects() {
    return this.ProjectsService.allproject();
  }
  @HttpCode(200)
  @UseInterceptors(FileInterceptor('file'))
  @Post('create')
  createProject(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new FileTypeValidator({ fileType: 'image/jpeg' })],
      }),
    )
    file: Express.Multer.File,
    project: Projects,
  ) {
    return this.ProjectsService.addProject(file, project);
  }
}

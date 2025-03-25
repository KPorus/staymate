import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Projects } from 'src/schema/project';
import { handleMongoErrors } from 'src/utils/error.handle';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Projects.name) private projectModel: Model<Projects>,
  ) {}

  async allproject(): Promise<Projects[]> {
    const projects = await this.projectModel.find();

    if (projects.length === 0) {
      throw new NotFoundException('No projects found');
    }

    return projects;
  }

  async addProject(file: Express.Multer.File, project: Projects) {
    try {
      return await new this.projectModel(project).save();
    } catch (error: unknown) {
      if (error instanceof Error) {
        handleMongoErrors(error);
      }
      throw new BadRequestException();
    }
  }
}

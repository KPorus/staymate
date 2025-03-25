import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
// import { JwtStrategy } from 'src/auth/strategy';
import { ProjectsController } from './projects.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Projects, ProjectSchema } from 'src/schema/project';
// import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Projects.name, schema: ProjectSchema }]),
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService],
})
export class ProjectsModule {}

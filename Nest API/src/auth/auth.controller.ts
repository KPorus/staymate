import { Body, Controller, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ILoginBody, RegisterBodyDto } from './dto';
import { Response } from 'express';
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/login')
  login(@Body() dto: ILoginBody, @Res() res: Response) {
    return this.authService.login(dto, res);
  }
  @Post('/register')
  register(@Body() dto: RegisterBodyDto) {
    // console.log(dto);
    return this.authService.register(dto);
  }
}

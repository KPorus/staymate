import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ILoginBody, RegisterBodyDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/login')
  login(@Body() dto: ILoginBody) {
    return this.authService.login(dto);
  }
  @Post('/register')
  register(@Body() dto: RegisterBodyDto) {
    console.log(dto);
    return this.authService.register(dto);
  }
}

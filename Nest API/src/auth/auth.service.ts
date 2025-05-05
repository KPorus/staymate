import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ILoginBody, RegisterBodyDto } from './dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserRole, Users } from '../schema/users';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { dycrypt, encryptPassword } from './encrypt';
import { handleMongoErrors } from 'src/utils/error.handle';
import { Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Users.name) private userModel: Model<Users>,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  // Login Function
  async login(dto: ILoginBody, res: Response) {
    const user = await this.userModel
      .findOne({ email: dto.email })
      .select('+password');
    if (!user) {
      throw new Error('Invalid credentials');
    }
    const { password, ...userData } = user.toObject();
    try {
      const dycrpttext = dycrypt(password);
      if (dycrpttext !== dto.pass) {
        throw new UnauthorizedException('Invalid credentials');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        handleMongoErrors(error, `Error login: ${error.message}`);
      }
      throw new UnauthorizedException('Unknown error occurred while log in');
    }
    const accessToken = await this.signToken(
      user._id.toString(),
      user.email,
      user.role,
    );

    return res.json({
      data: userData,
      token: accessToken,
    });
  }

  // Register Function
  async register(dto: RegisterBodyDto) {
    try {
      // console.log(await encryptPassword(dto.pass));
      const encrypt = await encryptPassword(dto.pass);
      const hash = encrypt.iv + ':' + encrypt.key + ':' + encrypt.encryptedText;
      const user = new this.userModel({
        username: dto.username,
        email: dto.email,
        role: dto.role,
        password: hash,
      });
      // console.log('indside', user);
      await user.save();

      return {
        id: user._id,
        username: user.username,
        email: user.email,
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        handleMongoErrors(error);
      }
      throw new Error('Unknown error occurred while registering user');
    }
  }

  // Sign JWT Token
  async signToken(
    id: string,
    email: string,
    role: UserRole,
  ): Promise<{ access_token: string }> {
    const payload = { sub: id, email, role };
    const token = await this.jwt.signAsync(payload, {
      secret: this.config.get<string>('JWT_SECRET'),
      expiresIn: '1h',
    });

    return {
      access_token: token,
    };
  }
}

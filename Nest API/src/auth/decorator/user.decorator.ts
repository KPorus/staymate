/* eslint-disable @typescript-eslint/no-unsafe-return */
import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { Users } from 'src/schema/users';

export const GetUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request: Express.Request = ctx.switchToHttp().getRequest();
    const user = request.user as Users;
    return data ? user[data] : user;
  },
);

import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { UserRole } from 'src/schema/users';

export class CommonGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const canActivate = (await super.canActivate(context)) as boolean;
    if (!canActivate) return false;
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not found');
    }
    if (user.role !== UserRole.MANAGER && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'Only MANAGER or ADMIN can access this route',
      );
    }

    return true;
  }
}

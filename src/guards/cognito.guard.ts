import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

export interface ICurrentUser {
  cognitoId: string;
  email: string;
  id: number;
  role: string;
  authData: any;
}

export class UserAuthGuard extends AuthGuard('jwt') {
  // getRequest(context: ExecutionContext) {
  //   const request = context.switchToHttp().getRequest();
  //   return request;
  // }

  canActivate(context: ExecutionContext) {
    // can Add the Custom Auth logic here
    return super.canActivate(context);
  }

  handleRequest(err, user) {
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}

export class AdminAuthGuard extends AuthGuard('jwt') {
  getRequest(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    return request;
  }

  canActivate(context: ExecutionContext) {
    // can Add the Custom Auth logic here
    return super.canActivate(context);
  }

  handleRequest(err, user) {
    if (err || !user || user.role !== 'ADMIN') {
      throw err || new UnauthorizedException("You don't have permission to access this resource");
    }
    return user;
  }
}

import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export const ClientIp = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.headers['x-client-ip'];
});

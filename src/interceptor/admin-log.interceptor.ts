import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ICurrentUser } from 'src/guards/cognito.guard';
import { AdminService } from 'src/module/admin/admin.service';
import { UserRole } from 'src/module/user/entities/user.entity';
import { logger } from 'src/utils/logger.config';

@Injectable()
export class AdminLogInterceptor implements NestInterceptor {
  constructor(private readonly adminService: AdminService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest();
    const { user }: { user: ICurrentUser } = request;

    if (user && user.role === UserRole.ADMIN && request.method !== 'GET') {
      logger.info(`Admin ${user.email} accessed ${request.url}`);
    } else {
      return next.handle();
    }

    const start_timestamp = Date.now();

    return next.handle().pipe(
      tap((response) => {
        const end_timestamp = Date.now();
        logger.info(
          `Admin ${user.email} accessed ${request.url} in ${end_timestamp - start_timestamp}ms`,
        );

        this.adminService.createAdminLog({
          admin: user.email,
          url: request.url,
          method: request.method,
          request_params: request.params,
          request_query: request.query,
          request_body: request.body,
          status: response.statusCode,
          response,
          start_timestamp,
          end_timestamp,
          time: end_timestamp - start_timestamp,
        });

        return;
      }),
    );
  }
}

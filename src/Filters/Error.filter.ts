import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';


@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    //const request = ctx.getRequest();

    const status = exception instanceof HttpException? exception.getStatus(): HttpStatus.INTERNAL_SERVER_ERROR;

    Logger.error(exception);

    console.log(exception);

    response.status(status).json({
      statusCode: status,
      status: false,
      message: exception.message,
      error_data: exception.response? (exception.response.data? exception.response.data: exception.response): {}
    });

    return ;

  }
}
import { NestFactory } from "@nestjs/core";
import helmet from "helmet";
import * as xss from 'xss-clean';
import * as logger from "morgan";
// import * as csurf from "csurf";
import { StartUpCon } from "./dbconnection";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { AllExceptionFilter } from "./Filters/Error.filter";

async function bootstrap() {
  await StartUpCon();
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Will only enable the fields that are given in the interface
    }),
  );
  app.useGlobalFilters(new AllExceptionFilter());
  app.use(helmet());
  app.use(xss());
  app.use(logger('dev'));
  app.enableCors();
  // app.use(csurf());
  await app.listen(3122);
}
bootstrap();

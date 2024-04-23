import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ProxyThrottleGuard } from './guards/proxy-throttle.guard';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './module/user/user.module';
import { AuthModule } from './module/auth/auth.module';

import DbConfig from './ormconfig.js';
import { PassportModule } from '@nestjs/passport';
import { JWTStrategy } from './module/auth/jwt.strategy';
import { AdminModule } from './module/admin/admin.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({ ...DbConfig, autoLoadEntities: true }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 20,
      },
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    UserModule,
    AuthModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ProxyThrottleGuard,
    },
    JWTStrategy,
  ],
})
export class AppModule {}

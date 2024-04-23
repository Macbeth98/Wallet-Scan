import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { AuthConfig } from './auth.config';
import { CognitoAuthService } from './cognito-auth.service';
import { AUTH_PROVIDER } from './interfaces/auth.interface';

@Module({
  imports: [UserModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthConfig,
    { provide: AUTH_PROVIDER, useClass: CognitoAuthService },
    CognitoAuthService,
  ],
  exports: [
    AuthService,
    { provide: AUTH_PROVIDER, useClass: CognitoAuthService },
    CognitoAuthService,
  ],
})
export class AuthModule {}

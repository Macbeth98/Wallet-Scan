import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthConfig } from './auth.config';
import { passportJwtSecret } from 'jwks-rsa';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JWTStrategy extends PassportStrategy(Strategy) {
  constructor() {
    console.log('JWTStrategy');
    super({
      jwtFromRequest: ExtractJwt.fromHeader('token'),
      ignoreExpiration: false,
      _audience: AuthConfig.clientId,
      issuer: AuthConfig.authority,
      algorithms: ['RS256'],
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `${AuthConfig.authority}/.well-known/jwks.json`,
      }),
    });
  }

  async validate(payload: { sub: string; email: string }) {
    return {
      cognitoId: payload.sub,
      email: payload.email,
      id: payload['custom:id'],
      role: payload['custom:role'],
      authData: payload,
    };
  }
}

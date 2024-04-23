import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthConfig {
  public static userPoolId: string = process.env.USER_POOL_ID || 'us-east-2_LG8GipuwT';
  public static clientId: string = process.env.CLIENT_ID || '1l1phpqf7kn8e9u7a6h41qkb04';
  public static region: string = process.env.REGION || 'us-east-2';
  public static authority: string = `https://cognito-idp.${AuthConfig.region}.amazonaws.com/${AuthConfig.userPoolId}`;
}

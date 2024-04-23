import { CognitoUser, CognitoUserAttribute, CognitoUserPool } from 'amazon-cognito-identity-js';
import { RegisterRequestDto } from './dto/register.dto';
import {
  IAttribute,
  IAuth,
  IAuthForgotPasswordResponse,
  IAuthLoginResponse,
  IAuthRegisterResponse,
  IAuthResetPasswordResponse,
} from './interfaces/auth.interface';
import { CognitoIdentityServiceProvider } from 'aws-sdk';
import { AuthConfig } from './auth.config';
import { LoginRequestDto } from './dto/login.dto';
import { Injectable } from '@nestjs/common';
import { UserRole } from 'aws-sdk/clients/workmail';
import { logger } from 'src/utils/logger.config';

@Injectable()
export class CognitoAuthService implements IAuth {
  private userPool: CognitoUserPool;
  private cognitoIdentityServiceProvider: CognitoIdentityServiceProvider;

  constructor() {
    this.userPool = new CognitoUserPool({
      UserPoolId: AuthConfig.userPoolId,
      ClientId: AuthConfig.clientId,
    });

    this.cognitoIdentityServiceProvider = new CognitoIdentityServiceProvider({
      region: AuthConfig.region,
      endpoint: AuthConfig.authority,
    });
  }

  async register(
    registerRequestDto: RegisterRequestDto,
    _role: UserRole,
  ): Promise<IAuthRegisterResponse> {
    const { email, password, username } = registerRequestDto;

    const dataEmail = {
      Name: 'email',
      Value: email,
    };

    const dataPhoneNumber = {
      Name: 'phone_number',
      Value: '',
    };

    const preferredUsername = {
      Name: 'preferred_username',
      Value: username,
    };

    const updatedAt = {
      Name: 'updated_at',
      Value: new Date().getTime().toString(),
    };

    const id = {
      Name: 'custom:id',
      Value: registerRequestDto.id.toString(),
    };

    const role = {
      Name: 'custom:role',
      Value: _role,
    };

    const attributeList = [
      new CognitoUserAttribute(dataEmail),
      new CognitoUserAttribute(dataPhoneNumber),
      new CognitoUserAttribute(preferredUsername),
      new CognitoUserAttribute(updatedAt),
      new CognitoUserAttribute(id),
      new CognitoUserAttribute(role),
    ];

    return new Promise((resolve, reject) => {
      this.userPool.signUp(email, password, attributeList, null, async (err, result) => {
        if (err) {
          reject(err);
          return;
        }

        const response: IAuthRegisterResponse = {
          status: true,
          message: 'User successfully registered. Please check your email for verification code!',
          codeDeliveryDetails: result.codeDeliveryDetails,
        };

        resolve(response);
        return;
      });
    });
  }

  resendConfirmation(email: string): Promise<IAuthRegisterResponse> {
    const user = new CognitoUser({
      Username: email,
      Pool: this.userPool,
    });

    return new Promise((resolve, reject) => {
      user.resendConfirmationCode((err, result) => {
        if (err) {
          reject(err);
          return;
        }

        const response: IAuthRegisterResponse = {
          status: true,
          message: 'Verification code successfully resent. Please check your email!',
          codeDeliveryDetails: result.CodeDeliveryDetails,
        };

        resolve(response);
        return;
      });
    });
  }

  login(loginRequestDto: LoginRequestDto, clientIp: string): Promise<IAuthLoginResponse> {
    const { email, password } = loginRequestDto;

    const params = {
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: AuthConfig.clientId,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      },
      UserContextData: {
        EncodedData: `Ip=${clientIp}`,
      },
    };

    return new Promise((resolve, reject) => {
      this.cognitoIdentityServiceProvider.initiateAuth(params, async (err, result) => {
        if (err) {
          reject(err);
          return;
        }

        const response: IAuthLoginResponse = {
          status: true,
          message: 'Login successful',
          tokenExpiresIn: result.AuthenticationResult.ExpiresIn,
          accessToken: result.AuthenticationResult.AccessToken,
          idToken: result.AuthenticationResult.IdToken,
          refreshToken: result.AuthenticationResult.RefreshToken,
        };

        resolve(response);
        return;
      });
    });
  }

  forgotPassword(email: string): Promise<IAuthForgotPasswordResponse> {
    const userData = {
      Username: email,
      Pool: this.userPool,
    };

    const cognitoUser = new CognitoUser(userData);

    return new Promise((resolve, reject) => {
      cognitoUser.forgotPassword({
        onSuccess: function (result) {
          return resolve({
            status: true,
            message: 'Password reset code sent to your email',
            codeDeliveryDetails: result.codeDeliveryDetails,
          });
        },
        onFailure: function (err) {
          return reject(err);
        },
        inputVerificationCode(data: {
          CodeDeliveryDetails: IAuthForgotPasswordResponse['codeDeliveryDetails'];
        }): void {
          return resolve({
            status: true,
            message: 'Password reset code sent to your email',
            codeDeliveryDetails: data.CodeDeliveryDetails,
          });
        },
      });
    });
  }

  resetPassword(
    email: string,
    code: string,
    newPassword: string,
  ): Promise<IAuthResetPasswordResponse> {
    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: this.userPool,
    });

    return new Promise((resolve, reject) => {
      cognitoUser.confirmPassword(code, newPassword, {
        onSuccess: function () {
          return resolve({
            status: true,
            message: 'Password successfully reset',
          });
        },
        onFailure: function (err) {
          return reject(err);
        },
      });
    });
  }

  updateUserAttributes(email: string, attributes: IAttribute): Promise<boolean> {
    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: this.userPool,
    });

    const attributeList = [];

    Object.keys(attributes).forEach((key) => {
      attributeList.push(
        new CognitoUserAttribute({
          Name: key,
          Value: attributes[key],
        }),
      );
    });

    return new Promise((resolve, reject) => {
      cognitoUser.updateAttributes(attributeList, (err, result) => {
        if (err) {
          reject(err);
          return;
        }

        logger.info(result, 'CognitoAuthService.editUserAttributes');
        resolve(true);
        return;
      });
    });
  }

  deleteUser(email: string): Promise<boolean> {
    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: this.userPool,
    });

    return new Promise((resolve, reject) => {
      cognitoUser.deleteUser((err, result) => {
        if (err) {
          reject(err);
          return;
        }

        logger.info(result, 'CognitoAuthService.deleteUser');
        resolve(true);
        return;
      });
    });
  }
}

import { UserRole } from 'aws-sdk/clients/workmail';
import { LoginRequestDto } from '../dto/login.dto';
import { RegisterRequestDto } from '../dto/register.dto';

export const AUTH_PROVIDER = 'AUTH_PROVIDER';

export interface IAuthRegisterResponse {
  status: boolean;
  message: string;
  codeDeliveryDetails: {
    AttributeName: string;
    DeliveryMedium: string;
    Destination: string;
  };
}

export interface IAuthLoginResponse {
  status: boolean;
  message: string;
  tokenExpiresIn: number;
  idToken: string;
  accessToken: string;
  refreshToken: string;
}

export interface IAuthForgotPasswordResponse {
  status: boolean;
  message: string;
  codeDeliveryDetails: {
    AttributeName: string;
    DeliveryMedium: string;
    Destination: string;
  };
}

export interface IAuthResetPasswordResponse {
  status: boolean;
  message: string;
}

export interface IAttribute {
  [key: string]: string;
}

export interface IAuth {
  register: (
    registerRequestDto: RegisterRequestDto,
    role: UserRole,
  ) => Promise<IAuthRegisterResponse>;

  resendConfirmation: (email: string) => Promise<IAuthRegisterResponse>;

  login: (LoginRequestDto: LoginRequestDto, clientIp: string) => Promise<IAuthLoginResponse>;

  forgotPassword: (email: string) => Promise<IAuthForgotPasswordResponse>;

  resetPassword: (
    email: string,
    code: string,
    newPassword: string,
  ) => Promise<IAuthResetPasswordResponse>;

  updateUserAttributes: (email: string, attributes: IAttribute) => Promise<boolean>;

  deleteUser: (email: string) => Promise<boolean>;
}

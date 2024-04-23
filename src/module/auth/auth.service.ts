import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { LoginResponseDto, LoginRequestDto } from './dto/login.dto';
import { RegisterRequestDto, RegisterResponseDto } from './dto/register.dto';
import { UserService } from '../user/user.service';
import { User, UserRole } from '../user/entities/user.entity';
import {
  AUTH_PROVIDER,
  IAttribute,
  IAuth,
  IAuthForgotPasswordResponse,
  IAuthLoginResponse,
  IAuthRegisterResponse,
  IAuthResetPasswordResponse,
} from './interfaces/auth.interface';
import { ForgotPasswordResponseDto, ResetPasswordResponseDto } from './dto/password.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject(AUTH_PROVIDER) private readonly authProvider: IAuth,
    private readonly userService: UserService,
  ) {}

  async register(registerRequestDto: RegisterRequestDto): Promise<RegisterResponseDto> {
    const { email, username } = registerRequestDto;

    const userExists = await this.userService.findOneByEmailOrUsername(email, username);

    if (userExists) {
      throw new BadRequestException('username or email already exists');
    }

    const user: User = await this.userService.create(registerRequestDto);

    let authResponse: IAuthRegisterResponse;

    registerRequestDto.id = user.id;

    try {
      authResponse = await this.authProvider.register(registerRequestDto, UserRole.USER);
    } catch (error) {
      await this.userService.remove(user.id);
      throw new BadRequestException(error);
    }

    return {
      status: 'OK',
      user: user,
      message: authResponse.message,
      codeDeliveryDetails: authResponse.codeDeliveryDetails,
    };
  }

  async resendConfirmation(email: string): Promise<RegisterResponseDto> {
    const user = await this.userService.findOneByEmail(email);

    if (!user) {
      throw new NotFoundException('user not found');
    }

    const authResponse: IAuthRegisterResponse = await this.authProvider.resendConfirmation(email);

    return {
      status: 'OK',
      user,
      message: authResponse.message,
      codeDeliveryDetails: authResponse.codeDeliveryDetails,
    };
  }

  async login(loginRequestDto: LoginRequestDto, clientIp: string): Promise<LoginResponseDto> {
    const { email } = loginRequestDto;

    const user: User = await this.userService.findOneByEmail(email);

    if (!user) {
      throw new NotFoundException('user not found');
    }

    const authResponse: IAuthLoginResponse = await this.authProvider.login(
      loginRequestDto,
      clientIp,
    );

    return {
      status: 'OK',
      user,
      tokenExpiresIn: authResponse.tokenExpiresIn,
      idToken: authResponse.idToken,
      accessToken: authResponse.accessToken,
      refreshToken: authResponse.refreshToken,
    };
  }

  async forgotPassword(email: string): Promise<ForgotPasswordResponseDto> {
    const user = await this.userService.findOneByEmail(email);

    if (!user) {
      throw new NotFoundException('user not found');
    }

    const authResponse: IAuthForgotPasswordResponse = await this.authProvider.forgotPassword(email);

    return {
      status: 'OK',
      message: authResponse.message,
      codeDeliveryDetails: authResponse.codeDeliveryDetails,
    };
  }

  async resetPassword(
    email: string,
    code: string,
    newPassword: string,
  ): Promise<ResetPasswordResponseDto> {
    const user = await this.userService.findOneByEmail(email);

    if (!user) {
      throw new NotFoundException('user not found');
    }

    const authResponse: IAuthResetPasswordResponse = await this.authProvider.resetPassword(
      email,
      code,
      newPassword,
    );

    if (!authResponse.status) {
      throw new BadRequestException('invalid code');
    }

    return {
      status: 'OK',
      message: authResponse.message,
    };
  }

  async updateUserRole(email: string, role: UserRole): Promise<boolean> {
    const user = await this.userService.findOneByEmail(email);

    if (!user) {
      throw new NotFoundException('user not found');
    }

    const attributes: IAttribute = {
      'custom:role': role,
    };

    const updated = await this.authProvider.updateUserAttributes(email, attributes);

    if (updated) {
      await this.userService.update(user.id, { role: role });
    }

    return updated;
  }

  async deleteUser(email: string): Promise<boolean> {
    const user = await this.userService.findOneByEmail(email);

    if (!user) {
      throw new NotFoundException('user not found');
    }

    await this.authProvider.deleteUser(email);

    return this.userService.remove(user.id);
  }
}

import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoginRequestDto, LoginResponseDto } from './dto/login.dto';
import { RegisterRequestDto, RegisterResponseDto } from './dto/register.dto';
import { AuthService } from './auth.service';
import { ClientIp } from 'src/decorators/client-ip.decorator';
import {
  EmailDto,
  ForgotPasswordResponseDto,
  ResetPasswordRequestDto,
  ResetPasswordResponseDto,
} from './dto/password.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login', description: 'Login' })
  @ApiResponse({ status: 200, description: 'Login', type: LoginResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  login(
    @Body() loginRequestDto: LoginRequestDto,
    @ClientIp() ip: string,
  ): Promise<LoginResponseDto> {
    return this.authService.login(loginRequestDto, ip);
  }

  @Post('register')
  @ApiOperation({ summary: 'Register', description: 'Register/Signup' })
  @ApiResponse({ status: 200, description: 'Register', type: RegisterResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request, Username or Email Already Exists!' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  register(@Body() registerRequestDto: RegisterRequestDto): Promise<RegisterResponseDto> {
    return this.authService.register(registerRequestDto);
  }

  @Post('resend-confirmation')
  @ApiOperation({
    summary: 'Resend confirmation',
    description: 'Resend confirmation email to the user email.',
  })
  @ApiResponse({ status: 200, description: 'Confirmation email sent successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'User not Found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  resendConfirmation(@Body() { email }: EmailDto): Promise<RegisterResponseDto> {
    return this.authService.resendConfirmation(email);
  }

  @Post('forgot-password')
  @ApiOperation({
    summary: 'Forgot password',
    description: 'Request Forgot password. This will send a verification code to the user email.',
  })
  @ApiResponse({ status: 200, description: 'Verification Code Successfully Sent to the Email.' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'User not Found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  forgotPassword(@Body() emailDto: EmailDto): Promise<ForgotPasswordResponseDto> {
    return this.authService.forgotPassword(emailDto.email);
  }

  @Post('reset-password')
  @ApiOperation({
    summary: 'Reset password',
    description: 'Reset the password using the code received from the Forgot Password API.',
  })
  @ApiResponse({ status: 200, description: 'Password Reset Successful' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'User not Found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  resetPassword(
    @Body() resetPasswordRequestDto: ResetPasswordRequestDto,
  ): Promise<ResetPasswordResponseDto> {
    const { email, code, newPassword } = resetPasswordRequestDto;
    return this.authService.resetPassword(email, code, newPassword);
  }
}

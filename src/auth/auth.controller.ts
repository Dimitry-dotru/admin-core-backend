import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Put,
  UnauthorizedException,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthPayloadDto } from './dto/auth-payload.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { GenerateOtpDto } from '../otp/dto/generate-otp.dto';
import { ChangePasswordDto } from './dto/chage-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { User } from 'src/users/entities/user.entity';
import { UserActivityService } from 'src/user-activity/user-activity.service';
import { ActivityActionType } from 'common/enums/activity-action-type';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly activityService: UserActivityService,
  ) {}

  @ApiOperation({ summary: 'Email+password auth' })
  @ApiBody({ type: AuthPayloadDto })
  @Post('login')
  @UseGuards(LocalAuthGuard)
  async login(@Request() req: { user: User }) {
    if (req.user.is_blocked) {
      throw new UnauthorizedException('You are blocked!');
    }
    const loginResult = this.authService.login(req.user);

    try {
      await this.activityService.logActivity({
        action: ActivityActionType.LOGIN,
        userId: req.user.id,
        details: `User ${req.user.username} logged in`,
        metadata: {
          user_id: req.user.id,
          email: req.user.email,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('Failed to log user activity:', error);
    }

    return loginResult;
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'Registration successful' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('change-password')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Change password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  async changePassword(
    @Request() req: { user: User },
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    console.log('What we received:', req.user, changePasswordDto);
    return this.authService.changePassword(req.user.id, changePasswordDto);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({ status: 200, description: 'Password reset request processed' })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password with OTP' })
  @ApiResponse({ status: 200, description: 'Password reset successful' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify email with OTP' })
  @ApiResponse({ status: 200, description: 'Email verification successful' })
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    return this.authService.verifyEmail(verifyEmailDto);
  }

  @Post('generate-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate a new OTP' })
  @ApiResponse({ status: 200, description: 'OTP generated successfully' })
  async generateOtp(@Body() generateOtpDto: GenerateOtpDto) {
    return this.authService.generateOtp(generateOtpDto);
  }
}

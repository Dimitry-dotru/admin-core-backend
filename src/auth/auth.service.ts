import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { OtpService } from '../otp/otp.service';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { User } from '../users/entities/user.entity';
import { OtpType } from 'common/enums/otp-type.enum';
import { ChangePasswordDto } from './dto/chage-password.dto';
import { OtpStatus } from 'common/enums/otp-status.enum';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly otpService: OtpService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<Omit<User, 'password'> | null> {
    try {
      const user = await this.usersService.findByEmail(email);
      const isPasswordValid = await this.usersService.comparePasswords(
        password,
        user.password,
      );

      if (isPasswordValid) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...result } = user;
        return result;
      }

      return null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  login(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
    };
    return {
      access_token: this.jwtService.sign(payload),
      status: 'success',
    };
  }

  async register(registerDto: RegisterDto) {
    const user = await this.usersService.create(registerDto);

    await this.generateOtp({
      email: user.email,
      type: OtpType.VERIFY_ACCOUNT,
    });

    // Return token
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: result,
    };
  }

  async changePassword(userId: number, changePasswordDto: ChangePasswordDto) {
    const user = await this.usersService.findOne(userId);
    const isPasswordValid = await this.usersService.comparePasswords(
      changePasswordDto.old_password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new HttpException('Invalid old password', HttpStatus.BAD_REQUEST);
    }

    await this.usersService.update(userId, {
      password: changePasswordDto.new_password,
    });

    return { message: 'Password changed successfully' };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.usersService.findByEmail(forgotPasswordDto.email);

    // Generate OTP for password reset
    await this.generateOtp({
      email: user.email,
      type: OtpType.RESET_PASSWORD,
    });

    return {
      message:
        'If your email exists in our system, we have sent a password reset code',
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const user = await this.usersService.findByEmail(resetPasswordDto.email);

    // Verify OTP
    const isOtpValid = await this.verifyOtp(
      user.id,
      resetPasswordDto.otp,
      OtpType.RESET_PASSWORD,
    );

    if (!isOtpValid) {
      throw new HttpException('Invalid or expired OTP', HttpStatus.BAD_REQUEST);
    }

    // Update password
    await this.usersService.update(user.id, {
      password: resetPasswordDto.new_password,
    });

    return { message: 'Password reset successfully' };
  }

  async verifyEmail(verifyEmailDto: VerifyEmailDto) {
    const user = await this.usersService.findByEmail(verifyEmailDto.email);

    // Verify OTP
    const isOtpValid = await this.verifyOtp(
      user.id,
      verifyEmailDto.otp,
      OtpType.VERIFY_ACCOUNT,
    );

    if (!isOtpValid) {
      throw new HttpException('Invalid or expired OTP', HttpStatus.BAD_REQUEST);
    }

    // Mark user as verified
    await this.usersService.update(user.id, {
      is_verified: true,
    });

    return { message: 'Email verified successfully' };
  }

  async generateOtp(data: { email: string; type: OtpType }) {
    const user = await this.usersService.findByEmail(data.email);

    // Generate 6-digit OTP
    const otpValue = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP
    await this.otpService.create({
      value: otpValue,
      expiration_minutes: 15, // 15 minutes expiration
      type: data.type,
      user_id: user.id,
    });

    // In a real application, you would send this OTP via email or SMS
    console.log(`OTP for ${data.email}: ${otpValue}`);

    return { message: 'OTP generated successfully' };
  }

  private async verifyOtp(
    userId: number,
    otpValue: string,
    otpType: OtpType,
  ): Promise<boolean> {
    try {
      const otp = await this.otpService.findValidOtp(userId, otpValue, otpType);

      if (!otp) {
        return false;
      }

      // Mark OTP as used
      await this.otpService.update(otp.id, {
        status: OtpStatus.USED,
      });

      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
}

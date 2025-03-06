import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import { UserService } from 'src/modules/user/user.service';

@Injectable()
export class ForgotPasswordUseCase {
  private readonly logger = new Logger(ForgotPasswordUseCase.name);

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailerService: MailerService
  ) {}

  async execute(email: string): Promise<void> {
    this.logger.debug(`Processing forgot password request for: ${email}`);
    
    // Find the user by email
    const user = await this.userService.findOne(email);

    if (!user) {
      this.logger.warn(`User not found for forgot password: ${email}`);
      throw new UnauthorizedException('USER_NOT_FOUND');
    }

    // Generate a JWT token for password reset
    this.logger.debug(`Generating password reset token for user: ${user._id}`);
    const token = await this.jwtService.signAsync(
      { sub: user._id, id: user._id },
      { expiresIn: '15m' },
    );

    // Generate reset URL
    const baseUrl = this.configService.get<string>('baseUrl');
    const url = `${baseUrl}/auth/reset-password?token=${token}`;
    this.logger.debug(`Reset URL generated: ${baseUrl}/auth/reset-password?token=***`);

    // Send email
    try {
      this.logger.debug(`Sending password reset email to: ${user.email}`);
      await this.mailerService.sendMail({
        to: user.email,
        from: this.configService.get<string>('email.auth.user'),
        subject: 'Reset Password',
        text: `Click on the link to reset your password: ${url}`,
        html: `<a href="${url}">Click here to reset your password</a>`,
      });
      
      this.logger.debug(`Password reset email sent successfully to: ${user.email}`);
    } catch (error) {
      this.logger.error(`Email sending failed: ${error.message}`, error.stack);
      throw new Error('EMAIL_SENDING_FAILED');
    }
  }
}
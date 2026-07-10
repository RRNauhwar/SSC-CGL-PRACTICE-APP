import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import {
  AuthResultDto,
  MessageDto,
  OtpRequestedDto,
  TokenPairDto,
  UserProfileDto,
} from '../application/dto/auth-response.dto';
import {
  GoogleLoginDto,
  LoginDto,
  RefreshDto,
  RegisterDto,
  RequestOtpDto,
  VerifyOtpDto,
} from '../application/dto/auth.dto';
import { AuthService } from '../application/services/auth.service';
import type { AuthenticatedUser, RequestContext } from '../domain/token.types';

import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import { ReqContext } from './decorators/request-context.decorator';

/**
 * Authentication endpoints. Sign-in routes are `@Public()` (the global JWT
 * guard is opt-out); `logout` and `me` require a valid access token.
 */
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register with email + password.' })
  @ApiOkResponse({ type: AuthResultDto })
  register(
    @Body() dto: RegisterDto,
    @ReqContext() context: RequestContext,
  ): Promise<AuthResultDto> {
    return this.auth.register(dto, context);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log in with email + password.' })
  @ApiOkResponse({ type: AuthResultDto })
  login(@Body() dto: LoginDto, @ReqContext() context: RequestContext): Promise<AuthResultDto> {
    return this.auth.login(dto, context);
  }

  @Public()
  @Post('otp/request')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request a one-time login code by email.' })
  @ApiOkResponse({ type: OtpRequestedDto })
  async requestOtp(@Body() dto: RequestOtpDto): Promise<OtpRequestedDto> {
    const result = await this.auth.requestOtp(dto);
    return {
      message: 'If the email is valid, a verification code has been sent.',
      expiresInSeconds: result.expiresInSeconds,
    };
  }

  @Public()
  @Post('otp/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify an email OTP and sign in (creates the account if new).' })
  @ApiOkResponse({ type: AuthResultDto })
  verifyOtp(
    @Body() dto: VerifyOtpDto,
    @ReqContext() context: RequestContext,
  ): Promise<AuthResultDto> {
    return this.auth.verifyOtp(dto, context);
  }

  @Public()
  @Post('google')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign in with a Google ID token.' })
  @ApiOkResponse({ type: AuthResultDto })
  google(
    @Body() dto: GoogleLoginDto,
    @ReqContext() context: RequestContext,
  ): Promise<AuthResultDto> {
    return this.auth.googleLogin(dto.idToken, context);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Exchange a refresh token for a new token pair (rotates the token).' })
  @ApiOkResponse({ type: TokenPairDto })
  refresh(@Body() dto: RefreshDto, @ReqContext() context: RequestContext): Promise<TokenPairDto> {
    return this.auth.refresh(dto.refreshToken, context);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke the current session (log out this device).' })
  @ApiOkResponse({ type: MessageDto })
  async logout(@CurrentUser() user: AuthenticatedUser): Promise<MessageDto> {
    await this.auth.logout(user.sessionId);
    return { message: 'Logged out' };
  }

  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke all sessions for the current user (log out everywhere).' })
  @ApiOkResponse({ type: MessageDto })
  async logoutAll(@CurrentUser() user: AuthenticatedUser): Promise<MessageDto> {
    await this.auth.logoutAll(user.id);
    return { message: 'Logged out of all sessions' };
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the authenticated user profile.' })
  @ApiOkResponse({ type: UserProfileDto })
  me(@CurrentUser() user: AuthenticatedUser): Promise<UserProfileDto> {
    return this.auth.getProfile(user.id);
  }
}

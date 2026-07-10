import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { MessageDto } from '../application/dto/auth-response.dto';
import { SessionDto } from '../application/dto/session.dto';
import { SessionService } from '../application/services/session.service';
import type { AuthenticatedUser } from '../domain/token.types';

import { CurrentUser } from './decorators/current-user.decorator';

/**
 * Session & device management endpoints (doc 15). All require authentication;
 * users may only view and revoke their own sessions.
 */
@ApiTags('Sessions')
@ApiBearerAuth()
@Controller('auth/sessions')
export class SessionController {
  constructor(private readonly sessions: SessionService) {}

  @Get()
  @ApiOperation({ summary: 'List the current user’s active sessions/devices.' })
  @ApiOkResponse({ type: SessionDto, isArray: true })
  list(@CurrentUser() user: AuthenticatedUser): Promise<SessionDto[]> {
    return this.sessions.listSessions(user.id, user.sessionId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revoke a specific session by id (must belong to the caller).' })
  @ApiOkResponse({ type: MessageDto })
  async revoke(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) sessionId: string,
  ): Promise<MessageDto> {
    const revoked = await this.sessions.revokeOwnedSession(user.id, sessionId);
    if (!revoked) {
      throw new NotFoundException('Session not found');
    }
    return { message: 'Session revoked' };
  }
}

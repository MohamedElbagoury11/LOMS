import { Controller, HttpCode, HttpStatus, Param, Post, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Request } from 'express';

import { ApiWrappedOkResponse } from '../../common/decorators/api-wrapped-ok-response.decorator';
import { ParseUuidPipe } from '../../common/pipes/parse-uuid.pipe';
import { RequirePermissions } from '../authorization/decorators/require-permissions.decorator';
import { PermissionsGuard } from '../authorization/guards/permissions.guard';
import { AuthService } from '../auth/auth.service';
import { AdminResetPasswordResponseDto } from '../auth/dto/admin-reset-password-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from './entities/user.entity';

type AuthenticatedRequest = Request & {
  user: User;
};

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly authService: AuthService) {}

  @Post(':id/reset-password')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('users.update')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Admin Password Reset',
    description:
      'Allows an administrator to reset a user password. Generates a temporary password ' +
      'and sets the mustChangePassword requirement. Requires `users.update` permission.',
  })
  @ApiWrappedOkResponse(
    AdminResetPasswordResponseDto,
    'Password reset successfully. Returns the temporary password.',
  )
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
  @ApiForbiddenResponse({ description: 'Missing required permission (users.update).' })
  async resetPassword(
    @Param('id', ParseUuidPipe) id: string,
    @Req() request: AuthenticatedRequest,
  ): Promise<AdminResetPasswordResponseDto> {
    return this.authService.adminResetPassword(request.user.id, id);
  }
}

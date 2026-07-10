import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Post,
    Req,
    Res,
    UnauthorizedException,
    UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    ApiBearerAuth,
    ApiCookieAuth,
    ApiNoContentResponse,
    ApiOperation,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Request, Response } from 'express';

import { ApiWrappedOkResponse } from '../../common/decorators/api-wrapped-ok-response.decorator';
import { NoStore } from '../../common/decorators/no-store.decorator';
import { AuthConfig } from '../../config/auth.config';
import { User } from '../users/entities/user.entity';
import { AuthService } from './auth.service';
import { AllowPasswordChangePending } from './decorators/allow-password-change-pending.decorator';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshResponseDto } from './dto/refresh-response.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

/**
 * Authentication controller.
 *
 * Exposes public endpoints for user authentication.
 * Full routes: /api/v1/auth/{login|refresh|logout|logout-all}
 * (prefix + versioning configured in main.ts)
 */
@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
    private readonly cookieName: string;

    constructor(
        private readonly authService: AuthService,
        private readonly configService: ConfigService,
    ) {
        const authCfg = this.configService.get<AuthConfig>('auth');
        this.cookieName = authCfg?.cookieName ?? 'rt';
    }

    // -------------------------------------------------------------------------
    // POST /auth/login
    // -------------------------------------------------------------------------

    /**
     * Authenticates the user, opens a session, and returns an Access Token.
     * The Refresh Token is delivered as an HttpOnly Secure SameSite=Strict
     * cookie named `rt`.
     */
    @Post('login')
    @HttpCode(HttpStatus.OK)
    @NoStore()
    @ApiOperation({
        summary: 'Login',
        description:
            'Validates credentials, creates a session, and returns an Access Token. ' +
            'The Refresh Token is set as an HttpOnly Secure cookie (`rt`).',
    })
    @ApiWrappedOkResponse(LoginResponseDto, 'Login successful.')
    @ApiUnauthorizedResponse({ description: 'Invalid credentials.' })
    async login(
        @Body() dto: LoginDto,
        @Req() request: Request,
        @Res({ passthrough: true }) response: Response,
    ): Promise<LoginResponseDto> {
        return this.authService.login(dto, request, response);
    }

    // -------------------------------------------------------------------------
    // POST /auth/refresh
    // -------------------------------------------------------------------------

    /**
     * Validates the Refresh Token cookie, rotates it, and returns a new
     * Access Token.  The rotated Refresh Token is written back into the cookie.
     */
    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    @NoStore()
    @AllowPasswordChangePending()
    @ApiOperation({
        summary: 'Refresh Access Token',
        description:
            'Reads the `rt` HttpOnly cookie, validates the session, rotates the ' +
            'Refresh Token, and returns a new Access Token.',
    })
    @ApiCookieAuth('rt')
    @ApiWrappedOkResponse(RefreshResponseDto, 'Token refreshed successfully.')
    @ApiUnauthorizedResponse({ description: 'Refresh token is missing, invalid, or expired.' })
    async refresh(
        @Req() request: Request,
        @Res({ passthrough: true }) response: Response,
    ): Promise<RefreshResponseDto> {
        const token = this.extractCookie(request);
        return this.authService.refresh(token, response);
    }

    // -------------------------------------------------------------------------
    // POST /auth/logout
    // -------------------------------------------------------------------------

    /**
     * Revokes the current session and clears the `rt` cookie.
     * The Access Token expires naturally (short-lived).
     */
    @Post('logout')
    @HttpCode(HttpStatus.NO_CONTENT)
    @NoStore()
    @AllowPasswordChangePending()
    @ApiOperation({
        summary: 'Logout',
        description:
            'Revokes the current session identified by the `rt` cookie. ' +
            'The cookie is cleared and the Access Token expires naturally.',
    })
    @ApiCookieAuth('rt')
    @ApiNoContentResponse({ description: 'Logged out successfully.' })
    @ApiUnauthorizedResponse({ description: 'Refresh token is missing or invalid.' })
    async logout(
        @Req() request: Request,
        @Res({ passthrough: true }) response: Response,
    ): Promise<void> {
        const token = this.extractCookie(request);
        await this.authService.logout(token, response);
    }

    // -------------------------------------------------------------------------
    // -------------------------------------------------------------------------
    // POST /auth/logout-all
    // -------------------------------------------------------------------------

    /**
     * Revokes ALL active sessions for the authenticated user and clears the
     * `rt` cookie.  Use this to force sign-out from every device.
     */
    @Post('logout-all')
    @HttpCode(HttpStatus.NO_CONTENT)
    @NoStore()
    @AllowPasswordChangePending()
    @ApiOperation({
        summary: 'Logout from All Devices',
        description:
            'Revokes every active session belonging to the user identified ' +
            'by the `rt` cookie. All devices are signed out immediately.',
    })
    @ApiCookieAuth('rt')
    @ApiNoContentResponse({ description: 'All sessions revoked successfully.' })
    @ApiUnauthorizedResponse({ description: 'Refresh token is missing or invalid.' })
    async logoutAll(
        @Req() request: Request,
        @Res({ passthrough: true }) response: Response,
    ): Promise<void> {
        const token = this.extractCookie(request);
        await this.authService.logoutAll(token, response);
    }

    // -------------------------------------------------------------------------
    // POST /auth/change-password
    // -------------------------------------------------------------------------

    /**
     * Changes the current authenticated user's password.
     *
     * Validates the old password, checks the password complexity policy, hashes the new
     * password using Argon2id, and turns off the must_change_password requirement.
     */
    @Post('change-password')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(JwtAuthGuard)
    @AllowPasswordChangePending()
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Change Password',
        description:
            'Allows an authenticated user to change their password by verifying ' +
            'their old password. The new password must satisfy system complexity requirements.',
    })
    @ApiNoContentResponse({ description: 'Password changed successfully.' })
    @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
    async changePassword(
        @Body() dto: ChangePasswordDto,
        @Req() request: Request,
    ): Promise<void> {
        const user = request.user as User;
        await this.authService.changePassword(user.id, dto);
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    /**
     * Reads the named refresh-token cookie from the request.
     * Throws 401 if the cookie is absent so callers do not need to guard.
     */
    private extractCookie(request: Request): string {
        const cookies = request.cookies as Record<string, string | undefined>;
        const token = cookies[this.cookieName];
        if (!token) {
            throw new UnauthorizedException('Refresh token is missing');
        }
        return token;
    }
}

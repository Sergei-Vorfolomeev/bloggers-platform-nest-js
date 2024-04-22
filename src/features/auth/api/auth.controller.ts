import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common'
import { UsersQueryRepository } from '../../users/infrastructure/users.query.repository'
import { AuthService } from '../application/auth.service'
import {
  LoginInputModel,
  NewPasswordRecoveryInputModel,
  PasswordRecoveryInputModel,
  RegistrationConfirmationCodeModel,
  RegistrationEmailResendingModel,
} from './models/auth-input.models'
import { Request, Response } from 'express'
import { handleExceptions } from '../../../base/utils/handle-exceptions'
import {
  UserAttachedInRequest,
  UserInputModel,
} from '../../users/api/models/user.input.model'
import { BearerAuthGuard } from '../../../infrastructure/guards/bearer-auth.guard'
import { LoginSuccessOutputModel } from './models/auth-output.models'
import { RefreshToken } from '../../../infrastructure/decorators/refresh-token.decorator'
import { User } from '../../../infrastructure/decorators/user.decorator'

@Controller('auth')
export class AuthController {
  constructor(
    protected readonly authService: AuthService,
    protected readonly usersQueryRepository: UsersQueryRepository,
  ) {}

  @Post('login')
  @HttpCode(200)
  async login(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: LoginInputModel,
  ): Promise<void> {
    const { loginOrEmail, password } = body
    const deviceName = req.headers['user-agent'] || 'unknown'
    const clientIp = req.ip || 'unknown'
    const { statusCode, error, data } = await this.authService.login(
      loginOrEmail,
      password,
      deviceName.toString(),
      clientIp,
    )
    handleExceptions(statusCode, error)
    res.cookie('refreshToken', data!.refreshToken, {
      httpOnly: true,
      secure: true,
    })
    res.status(200).send({ accessToken: data!.accessToken })
  }

  @Post('registration')
  @HttpCode(204)
  async registration(@Body() body: UserInputModel) {
    const { login, email, password } = body
    const { statusCode, error } = await this.authService.registerUser(
      login,
      email,
      password,
    )
    handleExceptions(statusCode, error)
  }

  @Get('me')
  @UseGuards(BearerAuthGuard)
  async me(@User() { id: userId }: UserAttachedInRequest) {
    if (!userId) {
      throw new UnauthorizedException()
    }
    const user = await this.usersQueryRepository.getUserById(userId)
    if (!user) {
      throw new UnauthorizedException()
    }
    return {
      userId: user.id,
      login: user.login,
      email: user.email,
    }
  }

  @Post('registration-confirmation')
  @HttpCode(204)
  async registrationConfirmation(
    @Body() body: RegistrationConfirmationCodeModel,
  ) {
    const { code } = body
    const { statusCode, error } =
      await this.authService.confirmEmailByCode(code)
    handleExceptions(statusCode, error)
  }

  @Post('registration-email-resending')
  @HttpCode(204)
  async registrationEmailResending(
    @Body() body: RegistrationEmailResendingModel,
  ) {
    const { email } = body
    const { statusCode, error } =
      await this.authService.resendConfirmationCode(email)
    handleExceptions(statusCode, error)
  }

  @Post('refresh-token')
  @HttpCode(200)
  async updateTokens(
    @RefreshToken() refreshToken: string,
    @Res() res: Response<LoginSuccessOutputModel>,
  ): Promise<void> {
    const { statusCode, error, data } =
      await this.authService.updateTokens(refreshToken)
    handleExceptions(statusCode, error)
    res.cookie('refreshToken', data!.refreshToken, {
      httpOnly: true,
      secure: true,
    })
    res.status(200).send({ accessToken: data!.accessToken })
  }

  @Post('logout')
  @HttpCode(204)
  async logout(@RefreshToken() refreshToken: string) {
    const { statusCode, error } = await this.authService.logout(refreshToken)
    handleExceptions(statusCode, error)
  }

  @Post('password-recovery')
  @HttpCode(204)
  async recoverPassword(@Body() body: PasswordRecoveryInputModel) {
    const { email } = body
    const { statusCode, error } = await this.authService.recoverPassword(email)
    handleExceptions(statusCode, error)
  }

  @Post('new-password')
  @HttpCode(204)
  async updatePassword(@Body() body: NewPasswordRecoveryInputModel) {
    const { recoveryCode, newPassword } = body
    const { statusCode, error } = await this.authService.updatePassword(
      recoveryCode,
      newPassword,
    )
    handleExceptions(statusCode, error)
  }
}

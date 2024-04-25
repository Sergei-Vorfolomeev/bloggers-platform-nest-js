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
import { LoginCommand } from '../application/usecases/login.usecase'
import { CommandBus } from '@nestjs/cqrs'
import { RegisterUserCommand } from '../application/usecases/register.usercase'
import { ConfirmEmailCommand } from '../application/usecases/confirm-email.usecase'
import { ResendConfirmationCodeCommand } from '../application/usecases/resend-confirmation-code.usecase'
import { LogoutCommand } from '../application/usecases/logout.usecase'
import { UpdateTokensCommand } from '../application/usecases/update-tokens.usecase'
import { RecoverPasswordCommand } from '../application/usecases/recover-password.usecase'
import { UpdatePasswordCommand } from '../application/usecases/update-password.usecase'

@Controller('auth')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
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
    const command = new LoginCommand(
      loginOrEmail,
      password,
      deviceName,
      clientIp,
    )
    const { statusCode, error, data } = await this.commandBus.execute(command)
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
    const command = new RegisterUserCommand(login, email, password)
    const { statusCode, error } = await this.commandBus.execute(command)
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
    const command = new ConfirmEmailCommand(body.code)
    const { statusCode, error } = await this.commandBus.execute(command)
    handleExceptions(statusCode, error)
  }

  @Post('registration-email-resending')
  @HttpCode(204)
  async registrationEmailResending(
    @Body() body: RegistrationEmailResendingModel,
  ) {
    const command = new ResendConfirmationCodeCommand(body.email)
    const { statusCode, error } = await this.commandBus.execute(command)
    handleExceptions(statusCode, error)
  }

  @Post('refresh-token')
  @HttpCode(200)
  async updateTokens(
    @RefreshToken() refreshToken: string,
    @Res() res: Response<LoginSuccessOutputModel>,
  ): Promise<void> {
    const command = new UpdateTokensCommand(refreshToken)
    const { statusCode, error, data } = await this.commandBus.execute(command)
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
    const command = new LogoutCommand(refreshToken)
    const { statusCode, error } = await this.commandBus.execute(command)
    handleExceptions(statusCode, error)
  }

  @Post('password-recovery')
  @HttpCode(204)
  async recoverPassword(@Body() body: PasswordRecoveryInputModel) {
    const command = new RecoverPasswordCommand(body.email)
    const { statusCode, error } = await this.commandBus.execute(command)
    handleExceptions(statusCode, error)
  }

  @Post('new-password')
  @HttpCode(204)
  async updatePassword(@Body() body: NewPasswordRecoveryInputModel) {
    const { recoveryCode, newPassword } = body
    const command = new UpdatePasswordCommand(recoveryCode, newPassword)
    const { statusCode, error } = await this.commandBus.execute(command)
    handleExceptions(statusCode, error)
  }
}

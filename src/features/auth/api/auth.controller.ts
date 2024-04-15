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
  RegistrationConfirmationCodeModel,
  RegistrationEmailResendingModel,
} from './models/auth-input.models'
import { Request, Response } from 'express'
import { handleExceptions } from '../../../base/utils/handle-exceptions'
import { UserInputModel } from '../../users/api/models/user.input.model'
import { BearerAuthGuard } from '../../../infrastructure/guards/bearer-auth.guard'
import { LoginSuccessOutputModel } from './models/auth-output.models'

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
  ): Promise<LoginSuccessOutputModel> {
    const { loginOrEmail, password } = body
    const deviceName = req.headers['user-agent'] || 'unknown'
    const clientIp = req.ip || 'unknown'
    const { statusCode, data } = await this.authService.login(
      loginOrEmail,
      password,
      deviceName.toString(),
      clientIp,
    )
    handleExceptions(statusCode)
    res.cookie('refreshToken', data!.refreshToken, {
      httpOnly: true,
      secure: true,
    })
    return { accessToken: data!.accessToken }
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
  async me(@Req() req: Request) {
    if (!req.user) {
      throw new UnauthorizedException()
    }
    const { id: userId } = req.user
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

  // @Post()
  // @HttpCode(200)
  // async refreshToken(
  //   @Req() req: Request,
  //   @Res() res: Response,
  // ): Promise<LoginSuccessOutputModel> {
  //   const refreshToken = req.cookies.refreshToken
  //   const { statusCode, errorsMessages, data } =
  //     await this.authService.updateTokens(refreshToken)
  //   handleExceptions(statusCode, errorsMessages)
  //   res.cookie('refreshToken', data!.refreshToken, {
  //     httpOnly: true,
  //     secure: true,
  //   })
  //   return { accessToken: data!.accessToken }
  // }

  // @Post('logout')
  // @HttpCode(204)
  // async logout(@Req() req: Request) {
  //   const refreshToken = req.cookies.refreshToken
  //   const { statusCode, errorsMessages } =
  //     await this.authService.logout(refreshToken)
  //   handleExceptions(statusCode, errorsMessages)
  // }
}

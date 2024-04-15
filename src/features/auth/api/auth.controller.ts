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
import { LoginInputModel } from './models/login-input.model'
import { Request, Response } from 'express'
import { handleExceptions } from '../../../base/utils/handle-exceptions'
import { UserInputModel } from '../../users/api/models/user.input.model'
import { UserOutputModel } from '../../users/api/models/user.output.model'
import { BearerAuthGuard } from '../../../infrastructure/guards/bearer-auth.guard'

@Controller('auth')
export class AuthController {
  constructor(
    protected readonly authService: AuthService,
    protected readonly usersQueryRepository: UsersQueryRepository,
  ) {}

  @Post('login')
  async login(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: LoginInputModel,
  ) {
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
    res.status(200).send({ accessToken: data!.accessToken })
  }

  @Post('registration')
  @HttpCode(204)
  async registration(@Body() body: UserInputModel) {
    const { login, email, password } = body
    const { statusCode, errorsMessages } = await this.authService.registerUser(
      login,
      email,
      password,
    )
    handleExceptions(statusCode, errorsMessages)
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
}

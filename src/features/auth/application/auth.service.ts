import { Injectable } from '@nestjs/common'
import { InterLayerObject, StatusCode } from '../../../base/interlayer-object'
import { UsersRepository } from '../../users/infrastructure/users.repository'
import { BcryptAdapter } from '../../../base/adapters/bcrypt.adapter'
import { JwtAdapter } from '../../../base/adapters/jwt.adapter'
import { randomUUID } from 'crypto'
import { EmailAdapter } from '../../../base/adapters/email.adapter'
import { DevicesRepository } from '../../devices/infrastructure/devices.repository'
import { templateForPasswordRecovery } from '../../../base/utils/template-for-password-recovery'

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly bcryptAdapter: BcryptAdapter,
    private readonly jwtAdapter: JwtAdapter,
    private readonly emailAdapter: EmailAdapter,
    private readonly devicesRepository: DevicesRepository,
  ) {}
}

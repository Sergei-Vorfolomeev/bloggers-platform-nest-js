import { EmailAdapter } from '../../src/base/adapters/email.adapter'
import { SentMessageInfo } from 'nodemailer'
import { ConfigService } from '@nestjs/config'
import { ConfigType } from '../../src/settings/configuration'

export class EmailAdapterMock extends EmailAdapter {
  constructor(configService: ConfigService<ConfigType, true>) {
    super(configService)
  }

  async sendEmail(
    email: string,
    subject: string,
    message: string,
  ): Promise<SentMessageInfo | null> {
    console.log('EmailAdapter has been successfully mocked')
    return Promise.resolve(true as SentMessageInfo)
  }
}

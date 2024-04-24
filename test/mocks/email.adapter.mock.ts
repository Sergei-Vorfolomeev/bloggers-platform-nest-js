import { EmailAdapter } from '../../src/base/adapters/email.adapter'
import { SentMessageInfo } from 'nodemailer'
import { ConfigService } from '@nestjs/config'

export class EmailAdapterMock extends EmailAdapter {
  constructor(configService: ConfigService) {
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

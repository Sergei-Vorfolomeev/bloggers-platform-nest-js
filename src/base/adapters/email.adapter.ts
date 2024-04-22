import { Injectable } from '@nestjs/common'
import nodemailer from 'nodemailer'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class EmailAdapter {
  constructor(private readonly configService: ConfigService) {}

  async sendEmail(email: string, subject: string, message: string) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: this.configService.get('emailAdapter.EMAIL'),
          pass: this.configService.get('emailAdapter.PASSWORD'),
        },
      })

      return await transporter.sendMail({
        from: 'Sergey <vorfo1897@gmail.com>',
        to: email,
        subject: subject,
        html: message,
      })
    } catch (error) {
      console.error(error)
      return null
    }
  }
}

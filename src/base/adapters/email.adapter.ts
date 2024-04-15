import { Injectable } from '@nestjs/common'
import { AppSettings } from '../../settings/app.settings'
import nodemailer from 'nodemailer'

@Injectable()
export class EmailAdapter {
  constructor(private readonly appSettings: AppSettings) {}

  async sendEmail(email: string, subject: string, message: string) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: this.appSettings.EMAIL,
          pass: this.appSettings.PASSWORD,
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

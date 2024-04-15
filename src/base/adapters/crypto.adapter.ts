import crypto from 'crypto'
import { Injectable } from '@nestjs/common'
import { AppSettings } from '../../settings/app.settings'

@Injectable()
export class CryptoAdapter {
  constructor(private readonly appSettings: AppSettings) {}

  encrypt(data: string) {
    // Создадим шифратор
    const cipher = crypto.createCipheriv(
      'aes-256-cbc',
      this.appSettings.SECRET_KEY_FOR_CIPHER,
      this.appSettings.INIT_VECTOR_FOR_CIPHER,
    )
    // Зашифруем данные
    let encryptedData = cipher.update(data, 'utf8', 'hex')
    encryptedData += cipher.final('hex')
    return encryptedData
  }

  decrypt(encryptedData: string) {
    // Создадим дешифратор
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      this.appSettings.SECRET_KEY_FOR_CIPHER,
      this.appSettings.INIT_VECTOR_FOR_CIPHER,
    )
    // Дешифруем данные
    let decryptedData = decipher.update(encryptedData, 'hex', 'utf8')
    decryptedData += decipher.final('utf8')
    return decryptedData
  }
}

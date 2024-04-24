import crypto from 'crypto'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ConfigType } from '../../settings/configuration'

@Injectable()
export class CryptoAdapter {
  constructor(
    private readonly configService: ConfigService<ConfigType, true>,
  ) {}

  encrypt(data: string) {
    // Создадим шифратор
    const cipher = crypto.createCipheriv(
      'aes-256-cbc',
      this.configService.get('cryptoAdapter.SECRET_KEY_FOR_CIPHER', {
        infer: true,
      }),
      this.configService.get('cryptoAdapter.INIT_VECTOR_FOR_CIPHER', {
        infer: true,
      }),
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
      this.configService.get('cryptoAdapter.SECRET_KEY_FOR_CIPHER', {
        infer: true,
      }),
      this.configService.get('cryptoAdapter.INIT_VECTOR_FOR_CIPHER', {
        infer: true,
      }),
    )
    // Дешифруем данные
    let decryptedData = decipher.update(encryptedData, 'hex', 'utf8')
    decryptedData += decipher.final('utf8')
    return decryptedData
  }
}

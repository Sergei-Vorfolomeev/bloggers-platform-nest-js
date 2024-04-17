import crypto from 'crypto'
import { config } from 'dotenv'
import { Injectable } from '@nestjs/common'

config()
// Сгенерируем ключ
// const KEY = crypto.pbkdf2Sync(
//   'prancypoodle',
//   'sherylcrowe',
//   10000,
//   32,
//   'sha512',
// )
const KEY = crypto.randomBytes(32) // 256 бит
// Сгенерируем инициализирующий вектор
const IV = crypto.randomBytes(16) // 128 бит

@Injectable()
export class AppSettings {
  static readonly MONGO_URI =
    process.env.MONGO_URL || 'mongodb://localhost:27017'
  readonly ADMIN_LOGIN = 'admin'
  readonly ADMIN_PASSWORD = 'qwerty'
  readonly SECRET_KEY_1 = process.env.SECRET_KEY_1 || '123'
  readonly SECRET_KEY_2 = process.env.SECRET_KEY_2 || '987'
  readonly EMAIL = process.env.EMAIL || 'test@gmail.com'
  readonly PASSWORD = process.env.PASSWORD || 'pass123'
  readonly SECRET_KEY_FOR_CIPHER = KEY
  readonly INIT_VECTOR_FOR_CIPHER = IV
}

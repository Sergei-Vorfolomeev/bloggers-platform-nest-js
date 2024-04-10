import crypto from 'crypto'
import { config } from 'dotenv'

config()
// Сгенерируем ключ
const KEY = crypto.randomBytes(32) // 256 бит
// Сгенерируем инициализирующий вектор
const IV = crypto.randomBytes(16) // 128 бит

export class appSettings {
  static readonly MONGO_URI =
    process.env.MONGO_URL || 'mongodb://localhost:27017'
  static readonly SECRET_KEY_1 = process.env.SECRET_KEY_1 || '123'
  static readonly SECRET_KEY_2 = process.env.SECRET_KEY_2 || '987'
  static readonly EMAIL = process.env.EMAIL || 'test@gmail.com'
  static readonly PASSWORD = process.env.PASSWORD || 'pass123'
  static readonly SECRET_KEY_FOR_CIPHER = KEY
  static readonly INIT_VECTOR_FOR_CIPHER = IV
}

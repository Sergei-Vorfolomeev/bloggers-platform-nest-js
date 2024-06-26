import crypto from 'crypto'
import * as process from 'process'

// Сгенерируем ключ
const KEY = crypto.pbkdf2Sync(
  'prancypoodle',
  'sherylcrowe',
  10000,
  32,
  'sha512',
)
// const KEY = crypto.randomBytes(32) // 256 бит
// Сгенерируем инициализирующий вектор
const IV = crypto.randomBytes(16) // 128 бит

const config = () => ({
  env: process.env.ENV,
  port: 3000,
  db: {
    MONGO_URI: process.env.MONGO_URI,
    PG_USER_LOGIN: process.env.PG_USER_LOGIN,
    PG_USER_PASSWORD: process.env.PG_USER_PASSWORD,
  },
  basicAuth: {
    BASIC_LOGIN: process.env.BASIC_LOGIN,
    BASIC_PASSWORD: process.env.BASIC_PASSWORD,
  },
  jwtAdapter: {
    SECRET_KEY_1: process.env.SECRET_KEY_1 || '123',
    SECRET_KEY_2: process.env.SECRET_KEY_2 || '987',
  },
  emailAdapter: {
    EMAIL: process.env.EMAIL || 'test@gmail.com',
    PASSWORD: process.env.PASSWORD || 'pass123',
  },
  cryptoAdapter: {
    SECRET_KEY_FOR_CIPHER: KEY,
    INIT_VECTOR_FOR_CIPHER: IV,
  },
})

export type ConfigType = ReturnType<typeof config>

export default config

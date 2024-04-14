import bcrypt from 'bcrypt'
import { Injectable } from '@nestjs/common'

@Injectable()
export class BcryptAdapter {
  async generateHash(password: string): Promise<string | null> {
    try {
      return await bcrypt.hash(password, 10)
    } catch (error) {
      console.error('Ошибка хеширования пароля:', error)
      return null
    }
  }

  async comparePasswords(
    password: string,
    hashedPassword: string | null,
  ): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hashedPassword as string)
    } catch (error) {
      console.error('Ошибка хеширования пароля:', error)
      return false
    }
  }
}

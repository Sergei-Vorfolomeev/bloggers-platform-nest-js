import { IUsersRepository } from '../application/interfaces/users-repository.interface'
import { DataSource } from 'typeorm'
import { UserDBModel } from '../domain/types'

export class UsersSqlRepository {
  constructor(private readonly dataSource: DataSource) {}

  // createUser(user: UserDBModel): Promise<string | null> {
  //   await this.dataSource.query(`
  //   SELECT
  //   `)
  // }
}

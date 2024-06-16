// import { IUsersQueryRepository } from '../application/interfaces/users-query-repository.interface'
// import { DataSource } from 'typeorm'
// import { UserOutputModel } from '../api/models/user.output.model'
// import { UsersSortParams } from '../domain/types'
// import { Paginator } from '../../../base/types'
//
// export class UsersQuerySqlRepository implements IUsersQueryRepository {
//   constructor(private readonly dataSource: DataSource) {}
//
//   async getUsers(
//     sortParams: UsersSortParams,
//   ): Promise<Paginator<UserOutputModel[]> | null> {
//     const {
//       searchLoginTerm,
//       searchEmailTerm,
//       pageSize,
//       pageNumber,
//       sortBy,
//       sortDirection,
//     } = sortParams
//
//     let query = 'SELECT * FROM public.users'
//
//     const params = []
//
//     if (searchLoginTerm) {
//       query += ' WHERE "login" = ?'
//       params.push(searchLoginTerm)
//     }
//
//     if (searchEmailTerm) {
//       if (searchLoginTerm) {
//         query += ' OR "email" = ?'
//       } else {
//         query += ' WHERE "email" = ?'
//       }
//       params.push(searchEmailTerm)
//     }
//
//     query += ' ORDER BY ? ?'
//     params.push(sortBy, sortDirection.toUpperCase())
//
//     query += ' LIMIT ?'
//     params.push(pageSize)
//
//     query += ' OFFSET ?'
//     params.push(pageNumber * pageSize)
//
//     await this.dataSource.query(query, params)
//   }
//
//   async getUserById(id: string): Promise<UserOutputModel | null> {}
//
//   async mapToView(user: WithId<UserDBModel>): UserOutputModel {}
// }

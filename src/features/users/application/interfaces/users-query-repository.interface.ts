import { UserDBModel, UsersSortParams } from '../../domain/types'
import { Paginator } from '../../../../base/types'
import { UserOutputModel } from '../../api/models/user.output.model'
import { WithId } from 'mongodb'

export interface IUsersQueryRepository {
  getUsers(
    sortParams: UsersSortParams,
  ): Promise<Paginator<UserOutputModel[]> | null>

  getUserById(id: string): Promise<UserOutputModel | null>

  mapToView(user: WithId<UserDBModel>): UserOutputModel
}

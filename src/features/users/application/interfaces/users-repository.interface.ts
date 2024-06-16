import { UserDocument } from '../../domain/user.entity'
import { UserDBModel } from '../../domain/types'
import { ObjectId, WithId } from 'mongodb'

export interface IUsersRepository {
  findUserByLoginOrEmail(loginOrEmail: string): Promise<UserDocument | null>

  findUserById(userId: string): Promise<UserDocument | null>

  createUser(user: UserDBModel): Promise<string | null>

  deleteUser(id: string): Promise<boolean>

  findByConfirmationCode(code: string): Promise<WithId<UserDBModel> | null>

  confirmEmail(userId: ObjectId): Promise<boolean>

  updateConfirmationCode(userId: ObjectId, newCode: string): Promise<boolean>

  addRecoveryCode(userId: ObjectId, recoveryCode: string): Promise<boolean>

  findUserByRecoveryCode(
    recoveryCode: string,
  ): Promise<WithId<UserDBModel> | null>

  updatePassword(userId: ObjectId, hashedPassword: string): Promise<boolean>
}

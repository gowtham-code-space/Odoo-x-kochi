import { findUserById, updateUser } from './users.repository.js';
import { NotFoundError } from '../../errors/HttpErrors.js';

export async function getUser(userId) {
  const user = await findUserById(userId);
  if (!user) throw new NotFoundError('User not found');
  return user;
}

export async function patchUser(userId, data) {
  const user = await findUserById(userId);
  if (!user) throw new NotFoundError('User not found');
  return updateUser(userId, data);
}


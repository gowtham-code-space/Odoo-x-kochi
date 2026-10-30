import { getUser, patchUser } from './users.service.js';
import { z } from 'zod';
import { validateRequest } from '../../middleware/validateRequest.js';

export async function handleGetProfile(req, res) {
  const user = await getUser(req.user.id);
  res.json({ success: true, data: { user } });
}

const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
});

export async function handleUpdateProfile(req, res) {
  const { name } = req.body;
  const user = await patchUser(req.user.id, { name });
  res.json({ success: true, data: { user } });
}

export { validateRequest, updateProfileSchema };


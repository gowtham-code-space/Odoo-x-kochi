import {
  createOrg, getUserOrganizations, getOrganization, switchOrganization, patchOrganization,
  listMembers, addMember, updateMemberRole, removeMember, getSettings, updateSettings,
} from './organizations.service.js';

export async function handleCreateOrg(req, res) {
  const org = await createOrg({ ...req.body, userId: req.user.id });
  res.status(201).json({ success: true, data: { organization: org } });
}

export async function handleListOrgs(req, res) {
  const organizations = await getUserOrganizations(req.user.id);
  res.json({ success: true, data: { organizations } });
}

export async function handleGetOrg(req, res) {
  const org = await getOrganization(req.params.organizationId, req.user.id);
  res.json({ success: true, data: { organization: org } });
}

export async function handleSwitchOrg(req, res) {
  const result = await switchOrganization(req.params.organizationId, req.user.id);
  res.json({ success: true, data: result });
}

export const handleUpdateOrg = async (req, res) => res.json({ success: true, data: { organization: await patchOrganization(req.params.organizationId, req.user.id, req.body) } });
export const handleListMembers = async (req, res) => res.json({ success: true, data: { memberships: await listMembers(req.params.organizationId, req.user.id) } });
export async function handleAddMember(req, res) {
  const membership = await addMember(req.params.organizationId, req.user.id, req.body);
  res.status(201).json({ success: true, data: { membership } });
}
export const handleUpdateMemberRole = async (req, res) => res.json({ success: true, data: { membership: await updateMemberRole(req.params.organizationId, req.user.id, req.params.membershipId, req.body.role) } });
export async function handleRemoveMember(req, res) {
  await removeMember(req.params.organizationId, req.user.id, req.params.membershipId);
  res.json({ success: true, data: { message: 'Member removed' } });
}
export const handleGetSettings = async (req, res) => res.json({ success: true, data: { settings: await getSettings(req.params.organizationId, req.user.id) } });
export const handleUpdateSettings = async (req, res) => res.json({ success: true, data: { settings: await updateSettings(req.params.organizationId, req.user.id, req.body) } });


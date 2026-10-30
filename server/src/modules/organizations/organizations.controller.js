import { createOrg, getUserOrganizations, getOrganization, switchOrganization } from './organizations.service.js';

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


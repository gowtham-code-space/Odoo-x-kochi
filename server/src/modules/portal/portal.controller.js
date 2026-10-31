import * as service from './portal.service.js';

export const handleGetPortal = async (req, res) => res.json({ success: true, data: await service.getPortalDashboard(req.user.id, req.organization.id) });
export const handleUpdateBillingProfile = async (req, res) => res.json({ success: true, data: { customer: await service.updateBillingProfile(req.user.id, req.organization.id, req.body) } });
export const handleCancellationRequest = async (req, res) => {
  const notification = await service.requestCancellation(req.user.id, req.organization.id, req.params.subscriptionId, req.body.reason);
  res.status(202).json({ success: true, data: { notification } });
};

import React, { useCallback, useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { PageHeader } from '../../components/layout/PageHeader.jsx';
import { Card } from '../../components/layout/Card.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { ErrorState } from '../../components/common/ErrorState.jsx';
import { Input } from '../../components/forms/Input.jsx';
import { Select } from '../../components/forms/Select.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { useOrganization } from '../../hooks/useOrganization.js';
import { useRole, isAdmin } from '../../hooks/useRole.js';
import { useToast } from '../../hooks/useToast.js';
import { updateProfile } from '../../services/user.service.js';
import { addMember, getMembers, getOrganization, getOrganizationSettings, updateOrganization, updateOrganizationSettings } from '../../services/organization.service.js';

export function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const { activeOrg, refreshOrganizations } = useOrganization();
  const role = useRole();
  const { addToast } = useToast();
  const [tab, setTab] = useState('profile');
  const [profile, setProfile] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [organization, setOrganization] = useState({ name: '', gstin: '', city: '', state: '' });
  const [settings, setSettings] = useState({ currency: 'INR', timezone: 'Asia/Kolkata', invoicePrefix: 'INV' });
  const [members, setMembers] = useState([]);
  const [invite, setInvite] = useState({ email: '', role: 'STAFF' });
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const loadAdminData = useCallback(async () => {
    if (!activeOrg?.id || !isAdmin(role)) return;
    try {
      const [fullOrg, memberData, settingData] = await Promise.all([
        getOrganization(activeOrg.id),
        getMembers(activeOrg.id),
        getOrganizationSettings(activeOrg.id),
      ]);
      setOrganization({ name: fullOrg.name || '', gstin: fullOrg.gstin || '', city: fullOrg.city || '', state: fullOrg.state || '' });
      setMembers(memberData);
      if (settingData) setSettings({ currency: settingData.currency, timezone: settingData.timezone, invoicePrefix: settingData.invoicePrefix });
      setError(null);
    } catch (requestError) { setError(requestError.response?.data?.error?.message || 'Could not load organization settings.'); }
  }, [activeOrg?.id, role]);
  useEffect(() => { loadAdminData(); }, [loadAdminData]);

  const saveProfile = async () => {
    setSaving(true);
    try { await updateProfile(profile); await refreshUser(); addToast({ type: 'success', title: 'Profile saved', message: 'Your profile was updated.' }); } catch (requestError) { addToast({ type: 'error', title: 'Profile not saved', message: requestError.response?.data?.error?.message || 'Try again.' }); } finally { setSaving(false); }
  };
  const saveOrganization = async () => {
    setSaving(true);
    try { await updateOrganization(activeOrg.id, organization); await refreshOrganizations(); addToast({ type: 'success', title: 'Organization saved', message: 'Organization details were updated.' }); } catch (requestError) { addToast({ type: 'error', title: 'Organization not saved', message: requestError.response?.data?.error?.message || 'Try again.' }); } finally { setSaving(false); }
  };
  const saveSettings = async () => {
    setSaving(true);
    try { await updateOrganizationSettings(activeOrg.id, settings); addToast({ type: 'success', title: 'Billing settings saved', message: 'Invoice settings were updated.' }); } catch (requestError) { addToast({ type: 'error', title: 'Settings not saved', message: requestError.response?.data?.error?.message || 'Try again.' }); } finally { setSaving(false); }
  };
  const inviteMember = async () => {
    setSaving(true);
    try { await addMember(activeOrg.id, invite); setInvite({ email: '', role: 'STAFF' }); await loadAdminData(); addToast({ type: 'success', title: 'Member added', message: 'The registered user received the selected role.' }); } catch (requestError) { addToast({ type: 'error', title: 'Member was not added', message: requestError.response?.data?.error?.message || 'The user must register first.' }); } finally { setSaving(false); }
  };
  const tabs = [{ id: 'profile', label: 'Profile', icon: 'lucide:user-round' }, ...(isAdmin(role) ? [{ id: 'organization', label: 'Organization', icon: 'lucide:building-2' }, { id: 'members', label: 'Members', icon: 'lucide:users' }, { id: 'billing', label: 'Billing', icon: 'lucide:receipt' }] : [])];
  return <div className="max-w-5xl"><PageHeader eyebrow="Settings" title="Preferences and administration" subtitle="Profile, organization, member, and billing settings persist through the API." />{error && <ErrorState message={error} onRetry={loadAdminData} className="mb-6" />}<div className="grid gap-6 md:grid-cols-[190px_1fr]"><nav className="rounded-xl border border-border bg-surface p-2">{tabs.map((item) => <button key={item.id} type="button" onClick={() => setTab(item.id)} className={'mb-1 flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm ' + (tab === item.id ? 'bg-primary/10 font-medium text-primary' : 'text-muted-foreground hover:bg-surface-raised hover:text-foreground')}><Icon icon={item.icon} className="h-4 w-4" />{item.label}</button>)}</nav><div className="space-y-6">{tab === 'profile' && <Card title="Personal profile" subtitle="Your authenticated account"><div className="grid gap-4 sm:grid-cols-2"><Input label="Display name" value={profile.name} onChange={(event) => setProfile((value) => ({ ...value, name: event.target.value }))} /><Input label="Phone" value={profile.phone || ''} onChange={(event) => setProfile((value) => ({ ...value, phone: event.target.value }))} /><Input label="Email address" value={user?.email || ''} disabled /></div><div className="mt-5"><Button onClick={saveProfile} isLoading={saving}>Save profile</Button></div></Card>}{tab === 'organization' && (!activeOrg ? <EmptyState title="Choose an organization" description="Organization settings require an active workspace." /> : <Card title="Organization profile" subtitle="Business information for invoices and operations"><div className="grid gap-4 sm:grid-cols-2"><Input label="Organization name" value={organization.name} onChange={(event) => setOrganization((value) => ({ ...value, name: event.target.value }))} /><Input label="GSTIN" value={organization.gstin} onChange={(event) => setOrganization((value) => ({ ...value, gstin: event.target.value }))} /><Input label="City" value={organization.city} onChange={(event) => setOrganization((value) => ({ ...value, city: event.target.value }))} /><Input label="State" value={organization.state} onChange={(event) => setOrganization((value) => ({ ...value, state: event.target.value }))} /></div><div className="mt-5"><Button onClick={saveOrganization} isLoading={saving}>Save organization</Button></div></Card>)}{tab === 'members' && <Card title="Organization members" subtitle="Add registered users and assign staff or customer access."><div className="overflow-x-auto"><table className="w-full min-w-[500px] text-left text-sm"><thead className="bg-surface-raised font-mono text-xs uppercase tracking-widest text-muted-foreground"><tr><th className="px-3 py-2.5">Member</th><th className="px-3 py-2.5">Role</th></tr></thead><tbody>{members.map((member) => <tr key={member.id} className="border-t border-border"><td className="px-3 py-3"><p className="font-medium">{member.user.name}</p><p className="text-xs text-muted-foreground">{member.user.email}</p></td><td className="px-3 py-3"><Badge variant={member.role === 'ADMIN' ? 'running' : member.role === 'STAFF' ? 'queued' : 'neutral'}>{member.role}</Badge></td></tr>)}</tbody></table></div><div className="mt-5 grid gap-3 sm:grid-cols-[1fr_150px_auto]"><Input label="Registered user email" type="email" value={invite.email} onChange={(event) => setInvite((value) => ({ ...value, email: event.target.value }))} /><Select label="Role" value={invite.role} onChange={(event) => setInvite((value) => ({ ...value, role: event.target.value }))} options={[{ value: 'STAFF', label: 'Staff' }, { value: 'CUSTOMER', label: 'Customer' }]} /><Button className="self-end" onClick={inviteMember} isLoading={saving}>Add member</Button></div></Card>}{tab === 'billing' && <Card title="Billing settings" subtitle="Tenant-level currency, timezone, and invoice prefix"><div className="grid gap-4 sm:grid-cols-3"><Input label="Currency" value={settings.currency} onChange={(event) => setSettings((value) => ({ ...value, currency: event.target.value.toUpperCase() }))} maxLength="3" /><Input label="Timezone" value={settings.timezone} onChange={(event) => setSettings((value) => ({ ...value, timezone: event.target.value }))} /><Input label="Invoice prefix" value={settings.invoicePrefix} onChange={(event) => setSettings((value) => ({ ...value, invoicePrefix: event.target.value.toUpperCase() }))} /></div><div className="mt-5"><Button onClick={saveSettings} isLoading={saving}>Save billing settings</Button></div></Card>}</div></div></div>;
}

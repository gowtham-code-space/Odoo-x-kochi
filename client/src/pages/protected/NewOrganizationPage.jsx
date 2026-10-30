import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/layout/PageHeader.jsx';
import { Card } from '../../components/layout/Card.jsx';
import { Input } from '../../components/forms/Input.jsx';
import { Textarea } from '../../components/forms/Textarea.jsx';
import { Button } from '../../components/common/Button.jsx';
import { createOrganization } from '../../services/organization.service.js';
import { useOrganization } from '../../hooks/useOrganization.js';
import { ROUTES } from '../../constants/routes.js';
import { useToast } from '../../hooks/useToast.js';
import { Icon } from '@iconify/react';

export function NewOrganizationPage() {
  const navigate = useNavigate();
  const { refreshOrganizations } = useOrganization();
  const { addToast } = useToast();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Auto-generate slug preview
  const slugPreview = name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const validate = () => {
    const errs = {};
    if (!name.trim()) {
      errs.name = 'Organization name is required';
    } else if (name.trim().length < 2) {
      errs.name = 'Name must be at least 2 characters';
    } else if (name.trim().length > 80) {
      errs.name = 'Name must be 80 characters or fewer';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) return;

    setLoading(true);
    try {
      const org = await createOrganization({ name, description });
      await refreshOrganizations();
      addToast({
        type: 'success',
        title: 'Organization created',
        message: `${org.name} has been provisioned as a new tenant.`,
      });
      navigate(ROUTES.ORGANIZATIONS);
    } catch (err) {
      setServerError(
        err.response?.data?.error?.message || 'Failed to create organization.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <PageHeader
        eyebrow="Tenant Setup"
        title="Provision Workspace"
        subtitle="Establish a new organization boundary with isolated schema access."
        breadcrumbs={[
          { label: 'Dashboard', to: ROUTES.DASHBOARD },
          { label: 'Organizations', to: ROUTES.ORGANIZATIONS },
          { label: 'New Organization' },
        ]}
      />

      {serverError && (
        <div className="mb-6 p-3 rounded-md border border-error/40 bg-error/10 text-error text-xs leading-relaxed">
          {serverError}
        </div>
      )}

      <Card>
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Organization Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
            placeholder="e.g. Bangalore Deep Learning Lab"
            required
          />

          {name && (
            <div className="p-3 rounded-md bg-input border border-border text-xs font-mono text-muted-foreground flex items-center gap-2">
              <Icon icon="lucide:link" className="w-3.5 h-3.5 text-muted-foreground" />
              <span>
                Generated Slug Preview:{' '}
                <strong className="text-foreground">{slugPreview || '...'}</strong>
              </span>
            </div>
          )}

          <Textarea
            label="Description (Optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Purpose, domain area, or lab charter..."
            rows={4}
          />

          <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(ROUTES.ORGANIZATIONS)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={loading}>
              Provision Organization
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}


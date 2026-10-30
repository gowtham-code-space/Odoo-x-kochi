import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/layout/PageHeader.jsx';
import { Card } from '../../components/layout/Card.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { Skeleton } from '../../components/common/Skeleton.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { ErrorState } from '../../components/common/ErrorState.jsx';
import { useOrganization } from '../../hooks/useOrganization.js';
import { ROUTES } from '../../constants/routes.js';
import { formatIST } from '../../utils/date.js';
import { Icon } from '@iconify/react';
import { useToast } from '../../hooks/useToast.js';

export function OrganizationsPage() {
  const navigate = useNavigate();
  const { organizations, activeOrg, switchOrg, loading, refreshOrganizations } = useOrganization();
  const { addToast } = useToast();
  const [error, setError] = useState(null);

  useEffect(() => {
    refreshOrganizations().catch((err) => {
      setError(err.response?.data?.error?.message || 'Failed to retrieve organizations.');
    });
  }, [refreshOrganizations]);

  const handleSwitch = async (orgId, name) => {
    try {
      await switchOrg(orgId);
      addToast({
        type: 'success',
        title: 'Tenant switched',
        message: `Switched active context to ${name}.`,
      });
    } catch {
      addToast({
        type: 'error',
        title: 'Switch failed',
        message: 'Could not switch active organization.',
      });
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Multi-Tenancy"
        title="Organizations & Tenancy"
        subtitle="Organizations partition your records, telemetry, and access policies."
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate(ROUTES.ORGANIZATIONS_NEW)}
          >
            <Icon icon="lucide:plus" className="w-4 h-4" />
            <span>Create Organization</span>
          </Button>
        }
      />

      {error && <ErrorState message={error} onRetry={refreshOrganizations} className="mb-6" />}

      {loading && organizations.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Skeleton height="180px" />
          <Skeleton height="180px" />
        </div>
      ) : organizations.length === 0 ? (
        <EmptyState
          icon="lucide:building-2"
          title="No organizations found"
          description="You are not a member of any organization yet. Provision a new one to begin."
          actionLabel="Create Workspace"
          onAction={() => navigate(ROUTES.ORGANIZATIONS_NEW)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {organizations.map((org) => {
            const isActive = org.id === activeOrg?.id;
            const userRole = org.memberships?.[0]?.role || 'MEMBER';

            return (
              <div
                key={org.id}
                className={`rounded-xl border transition-all ${
                  isActive
                    ? 'border-primary/50 bg-surface shadow-md'
                    : 'border-border bg-surface hover:border-border/80'
                } p-6 flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-md bg-surface-raised border border-border flex items-center justify-center font-mono font-bold text-sm text-foreground">
                        {org.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-headings text-lg font-bold text-foreground leading-tight">
                          {org.name}
                        </h3>
                        <span className="text-xs font-mono text-muted-foreground">
                          slug: {org.slug}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-sm bg-muted text-muted-foreground border border-border shrink-0">
                      {userRole}
                    </span>
                  </div>

                  {org.description ? (
                    <p className="text-xs text-muted-foreground line-clamp-2 my-3">
                      {org.description}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground italic my-3">
                      No description provided.
                    </p>
                  )}
                </div>

                <div className="pt-4 mt-2 border-t border-border flex items-center justify-between text-xs font-mono text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <span>
                      {org._count?.memberships || org.memberships?.length || 1} Member(s)
                    </span>
                    <span>Created: {formatIST(org.createdAt).split(' ')[0]}</span>
                  </div>
                  <div>
                    {isActive ? (
                      <Badge variant="running">
                        <span>Active Tenant</span>
                      </Badge>
                    ) : (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleSwitch(org.id, org.name)}
                      >
                        Switch to
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


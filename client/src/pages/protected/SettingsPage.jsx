import React from 'react';
import { PageHeader } from '../../components/layout/PageHeader.jsx';
import { Card } from '../../components/layout/Card.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { InnerTile } from '../../components/layout/InnerTile.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { useOrganization } from '../../hooks/useOrganization.js';
import { ROUTES } from '../../constants/routes.js';
import { formatIST } from '../../utils/date.js';
import { Icon } from '@iconify/react';

export function SettingsPage() {
  const { user } = useAuth();
  const { activeOrg } = useOrganization();

  return (
    <div className="max-w-4xl">
      <PageHeader
        eyebrow="System Configuration"
        title="Settings & Governance"
        subtitle="Account specifications, compliance declarations, and security policies."
        breadcrumbs={[
          { label: 'Dashboard', to: ROUTES.DASHBOARD },
          { label: 'Settings' },
        ]}
      />

      <div className="space-y-6">
        {/* User Identity Card */}
        <Card title="User Identity Profile" subtitle="Authenticated identity details">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InnerTile>
              <span className="text-xs text-muted-foreground uppercase font-mono block mb-1">
                Display Name
              </span>
              <p className="font-medium text-foreground">{user?.name || '-'}</p>
            </InnerTile>

            <InnerTile>
              <span className="text-xs text-muted-foreground uppercase font-mono block mb-1">
                Corporate Email
              </span>
              <p className="font-mono text-foreground text-sm">{user?.email || '-'}</p>
            </InnerTile>

            <InnerTile>
              <span className="text-xs text-muted-foreground uppercase font-mono block mb-1">
                Active Tenant Context
              </span>
              <p className="font-medium text-foreground">
                {activeOrg?.name || 'No tenant selected'}
              </p>
              {activeOrg && (
                <span className="text-[11px] font-mono text-muted-foreground">
                  ID: {activeOrg.id}
                </span>
              )}
            </InnerTile>

            <InnerTile>
              <span className="text-xs text-muted-foreground uppercase font-mono block mb-1">
                Account Created
              </span>
              <p className="font-mono text-foreground text-xs">
                {user?.createdAt ? formatIST(user.createdAt) : '-'}
              </p>
            </InnerTile>
          </div>
        </Card>

        {/* Security & Token Architecture */}
        <Card
          title="Security & Session Policy"
          subtitle="Enterprise hardened cookie parameters"
        >
          <div className="space-y-3 text-xs leading-relaxed text-muted-foreground">
            <div className="p-3 rounded-md bg-input border border-border flex items-start gap-3">
              <Icon icon="lucide:shield-check" className="w-5 h-5 text-success shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground text-sm mb-0.5">
                  HTTP-Only Browser Session
                </p>
                <p>
                  Authentication uses tamper-resistant, signed JWTs stored exclusively in HTTP-only, SameSite=Lax browser cookies. Tokens are inaccessible to JavaScript, protecting against XSS attacks.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-md bg-input border border-border flex items-start gap-3">
              <Icon icon="lucide:lock" className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground text-sm mb-0.5">
                  Tenant Boundary Enforcement
                </p>
                <p>
                  No client header is trusted without independent server-side database verification against the <code className="font-mono text-foreground">memberships</code> relation table.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Compliance and Data Residency */}
        <Card
          title="Compliance & Data Residency"
          subtitle="Verification per Digital Personal Data Protection (DPDP) Act"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Badge variant="compliance">DPDP Aligned</Badge>
              <Badge variant="compliance">ap-south-1 Sovereign</Badge>
              <Badge variant="compliance">Zero Data Retention (ZDR)</Badge>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              All evaluations, database analytics queries, and telemetry remain strictly stored within Indian borders (AWS ap-south-1 Mumbai region). Audit trails are immutable and retained for 180 days per national data regulatory mandates.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}


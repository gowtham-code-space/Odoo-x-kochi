import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes.js';
import { Button } from '../../components/common/Button.jsx';
import { Icon } from '@iconify/react';

export function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 text-foreground">
      <div className="max-w-md w-full rounded-xl border border-border bg-surface p-8 text-center shadow-xl">
        <div className="w-12 h-12 rounded-xl bg-error/10 border border-error/30 flex items-center justify-center mx-auto mb-4 text-error">
          <Icon icon="lucide:shield-alert" className="w-6 h-6" />
        </div>
        <span className="font-mono text-xs uppercase tracking-widest text-error font-semibold">
          Access Denied &bull; 403
        </span>
        <h1 className="font-headings text-2xl font-bold mt-1 mb-2">Insufficient Permissions</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Your current membership role does not grant permission to view or manipulate this tenant resource. Contact your organization OWNER.
        </p>
        <Link to={ROUTES.DASHBOARD}>
          <Button variant="secondary" className="w-full">
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}


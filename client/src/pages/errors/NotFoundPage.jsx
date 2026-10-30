import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes.js';
import { Button } from '../../components/common/Button.jsx';
import { Icon } from '@iconify/react';

export function NotFoundPage() {
  const reqId = 'req-' + Math.random().toString(36).substring(2, 9);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 text-foreground">
      <div className="max-w-md w-full rounded-xl border border-border bg-surface p-8 text-center shadow-xl">
        <div className="w-12 h-12 rounded-xl bg-surface-raised border border-border flex items-center justify-center mx-auto mb-4 text-muted-foreground">
          <Icon icon="lucide:file-question" className="w-6 h-6" />
        </div>
        <span className="font-mono text-xs uppercase tracking-widest text-primary font-semibold">
          Error 404
        </span>
        <h1 className="font-headings text-2xl font-bold mt-1 mb-2">Page Not Found</h1>
        <p className="text-sm text-muted-foreground mb-4">
          The requested route does not exist or has been moved to another location.
        </p>
        <div className="mb-6 p-2 rounded-md bg-input border border-border font-mono text-xs text-muted-foreground">
          Reference ID: <span className="text-foreground">{reqId}</span>
        </div>
        <Link to={ROUTES.DASHBOARD}>
          <Button variant="primary" className="w-full">
            Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}


import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { ToastContainer } from '../components/feedback/ToastContainer.jsx';
import { ROUTES } from '../constants/routes.js';

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-center items-center px-4 py-12 sm:px-6 lg:px-8 selection:bg-primary/20 selection:text-primary">
      {/* Brand Header */}
      <div className="w-full max-w-md mx-auto text-center mb-8">
        <Link to={ROUTES.HOME} className="inline-flex items-center gap-3 mb-3 group">
          <div
            className="w-9 h-9 rounded-md flex items-center justify-center text-primary-foreground font-bold text-base shadow-sm"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            S
          </div>
          <span className="font-headings font-semibold text-xl tracking-tight text-foreground">
            SubsManager
          </span>
        </Link>
        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground font-medium">
          Subscription Billing Platform
        </p>
      </div>

      {/* Main Form Card */}
      <div className="w-full max-w-md mx-auto">
        <div className="bg-surface border border-border rounded-xl p-8 sm:p-10">
          <Outlet />
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs font-mono text-muted-foreground flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-success" />
            Secure · Multi-tenant · GST compliant
          </p>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
}

import React from 'react';
import { Outlet } from 'react-router-dom';
import { ToastContainer } from '../components/feedback/ToastContainer.jsx';

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-[#090c13] text-[#f5f3ee] flex flex-col justify-center items-center px-4 py-12 sm:px-6 lg:px-8 selection:bg-primary selection:text-white">
      {/* Brand Header */}
      <div className="w-full max-w-md mx-auto text-center mb-8">
        <div className="inline-flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-headings font-bold text-xl shadow-lg shadow-primary/20">
            N
          </div>
          <span className="font-headings font-bold text-2xl tracking-tight text-foreground">
            Nexus
          </span>
        </div>
        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground font-medium">
          Enterprise Operations Platform
        </p>
      </div>

      {/* Main Form Card */}
      <div className="w-full max-w-md mx-auto">
        <div className="bg-[#111622] border border-[#222c3f] rounded-2xl p-8 sm:p-10 shadow-2xl shadow-black/40">
          <Outlet />
        </div>

        {/* Security & Region Footer */}
        <div className="mt-8 text-center space-y-1">
          <p className="text-xs font-mono text-muted-foreground flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-success" />
            Isolated Multi-Tenant Security &bull; High Availability Cluster
          </p>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
}

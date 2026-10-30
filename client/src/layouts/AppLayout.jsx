import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar.jsx';
import { TopBar } from '../components/layout/TopBar.jsx';
import { ToastContainer } from '../components/feedback/ToastContainer.jsx';

export function AppLayout() {
  return (
    <div className="flex h-screen bg-[#090c13] overflow-hidden text-[#f5f3ee]">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1400px] mx-auto px-10 py-10">
            <Outlet />
          </div>
        </main>
      </div>

      <ToastContainer />
    </div>
  );
}

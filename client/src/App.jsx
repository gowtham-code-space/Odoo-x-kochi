import React from 'react';
import { AuthProvider } from './context/AuthContext.jsx';
import { OrgProvider } from './context/OrgContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import { AppRouter } from './routes/AppRouter.jsx';

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <OrgProvider>
          <AppRouter />
        </OrgProvider>
      </AuthProvider>
    </ToastProvider>
  );
}


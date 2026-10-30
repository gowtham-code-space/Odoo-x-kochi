import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes.js';

// Layouts
import { AuthLayout } from '../layouts/AuthLayout.jsx';
import { AppLayout } from '../layouts/AppLayout.jsx';

// Route Guards
import { ProtectedRoute } from './ProtectedRoute.jsx';
import { PublicRoute } from './PublicRoute.jsx';

// Pages
import { LoginPage } from '../pages/public/LoginPage.jsx';
import { RegisterPage } from '../pages/public/RegisterPage.jsx';
import { DashboardPage } from '../pages/protected/DashboardPage.jsx';
import { OrganizationsPage } from '../pages/protected/OrganizationsPage.jsx';
import { NewOrganizationPage } from '../pages/protected/NewOrganizationPage.jsx';
import { SettingsPage } from '../pages/protected/SettingsPage.jsx';
import { AnalyticsPage } from '../pages/protected/AnalyticsPage.jsx';
import { NLAnalyticsPage } from '../pages/protected/NLAnalyticsPage.jsx';
import { NotFoundPage } from '../pages/errors/NotFoundPage.jsx';
import { UnauthorizedPage } from '../pages/errors/UnauthorizedPage.jsx';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Root Redirect */}
        <Route path="/" element={<Navigate to={ROUTES.DASHBOARD} replace />} />

        {/* Public-only routes (redirects authenticated users to dashboard) */}
        <Route element={<PublicRoute />}>
          <Route element={<AuthLayout />}>
            <Route path={ROUTES.LOGIN} element={<LoginPage />} />
            <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
          </Route>
        </Route>

        {/* Protected enterprise application routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
            <Route path={ROUTES.ORGANIZATIONS} element={<OrganizationsPage />} />
            <Route path={ROUTES.ORGANIZATIONS_NEW} element={<NewOrganizationPage />} />
            <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
            <Route path={ROUTES.ANALYTICS} element={<AnalyticsPage />} />
            <Route path={ROUTES.ANALYTICS_NL} element={<NLAnalyticsPage />} />
          </Route>
        </Route>

        {/* Error pages */}
        <Route path={ROUTES.UNAUTHORIZED} element={<UnauthorizedPage />} />
        <Route path={ROUTES.NOT_FOUND} element={<NotFoundPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}


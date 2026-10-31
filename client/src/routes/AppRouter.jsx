import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes.js';

// Layouts
import { AuthLayout } from '../layouts/AuthLayout.jsx';
import { AppLayout } from '../layouts/AppLayout.jsx';

// Route Guards
import { ProtectedRoute } from './ProtectedRoute.jsx';
import { PublicRoute } from './PublicRoute.jsx';
import { RoleRoute } from './RoleRoute.jsx';

// Pages
import { LoginPage } from '../pages/public/LoginPage.jsx';
import { RegisterPage } from '../pages/public/RegisterPage.jsx';
import { LandingPage } from '../pages/public/LandingPage.jsx';
import { ForgotPasswordPage } from '../pages/public/ForgotPasswordPage.jsx';
import { ResetPasswordPage } from '../pages/public/ResetPasswordPage.jsx';
import { DashboardPage } from '../pages/protected/DashboardPage.jsx';
import { OrganizationsPage } from '../pages/protected/OrganizationsPage.jsx';
import { NewOrganizationPage } from '../pages/protected/NewOrganizationPage.jsx';
import { SettingsPage } from '../pages/protected/SettingsPage.jsx';
import { ProductsPage } from '../pages/protected/ProductsPage.jsx';
import { PlansPage, QuotationsPage, SubscriptionsPage, InvoicesPage, PaymentsPage, DiscountsPage, CustomersPage, CustomerPortalPage, ReportsPage } from '../pages/protected/BusinessPages.jsx';
import { AnalyticsPage } from '../pages/protected/AnalyticsPage.jsx';
import { NLAnalyticsPage } from '../pages/protected/NLAnalyticsPage.jsx';
import { NotFoundPage } from '../pages/errors/NotFoundPage.jsx';
import { UnauthorizedPage } from '../pages/errors/UnauthorizedPage.jsx';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.HOME} element={<LandingPage />} />

        {/* Public-only routes (redirects authenticated users to dashboard) */}
        <Route element={<PublicRoute />}>
          <Route element={<AuthLayout />}>
            <Route path={ROUTES.LOGIN} element={<LoginPage />} />
            <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
            <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
            <Route path={ROUTES.RESET_PASSWORD} element={<ResetPasswordPage />} />
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
            <Route element={<RoleRoute allowedRoles={['ADMIN', 'STAFF']} />}>
              <Route path={ROUTES.PRODUCTS} element={<ProductsPage />} />
              <Route path={ROUTES.PRODUCT_NEW} element={<ProductsPage />} />
              <Route path={ROUTES.PLANS} element={<PlansPage />} />
              <Route path={ROUTES.PLAN_NEW} element={<PlansPage />} />
              <Route path={ROUTES.QUOTATIONS} element={<QuotationsPage />} />
              <Route path={ROUTES.QUOTATION_NEW} element={<QuotationsPage />} />
              <Route path={ROUTES.SUBSCRIPTIONS} element={<SubscriptionsPage />} />
              <Route path={ROUTES.SUBSCRIPTION_NEW} element={<SubscriptionsPage />} />
              <Route path={ROUTES.CUSTOMERS} element={<CustomersPage />} />
              <Route path={ROUTES.REPORTS} element={<ReportsPage />} />
              <Route path={ROUTES.INVOICES} element={<InvoicesPage />} />
              <Route path={ROUTES.PAYMENTS} element={<PaymentsPage />} />
            </Route>
            <Route element={<RoleRoute allowedRoles={['ADMIN']} />}>
              <Route path={ROUTES.DISCOUNTS} element={<DiscountsPage />} />
            </Route>
            <Route path={ROUTES.PORTAL} element={<CustomerPortalPage />} />
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


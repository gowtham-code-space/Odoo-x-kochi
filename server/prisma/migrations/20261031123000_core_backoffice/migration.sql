-- Safe additive migration for local PostgreSQL development.  It deliberately
-- contains no DROP, TRUNCATE, reset, or enum replacement statements.

CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCEEDED', 'FAILED', 'REFUNDED');

ALTER TYPE "BillingFrequency" ADD VALUE 'DAILY';
ALTER TYPE "BillingFrequency" ADD VALUE 'WEEKLY';
ALTER TYPE "InvoiceStatus" ADD VALUE 'CONFIRMED';
ALTER TYPE "QuotationStatus" ADD VALUE 'ACCEPTED';
ALTER TYPE "QuotationStatus" ADD VALUE 'REJECTED';
ALTER TYPE "QuotationStatus" ADD VALUE 'EXPIRED';
ALTER TYPE "SubscriptionStatus" ADD VALUE 'QUOTATION';
ALTER TYPE "SubscriptionStatus" ADD VALUE 'CONFIRMED';
ALTER TYPE "SubscriptionStatus" ADD VALUE 'ACTIVE';

ALTER TABLE "discounts"
  ADD COLUMN "maxUsesPerCustomer" INTEGER,
  ADD COLUMN "minQuantity" INTEGER,
  ADD COLUMN "productId" TEXT;
ALTER TABLE "invoices" ADD COLUMN "customerId" TEXT;
ALTER TABLE "payments"
  ADD COLUMN "failureReason" TEXT,
  ADD COLUMN "provider" TEXT,
  ADD COLUMN "providerReference" TEXT,
  ADD COLUMN "refundedAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING';
ALTER TABLE "plans"
  ADD COLUMN "allowEarlyClose" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "allowPause" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "allowRenewal" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "autoCloseAtEnd" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "features" JSONB,
  ADD COLUMN "paymentTermsDays" INTEGER NOT NULL DEFAULT 30;
ALTER TABLE "subscriptions"
  ADD COLUMN "customerId" TEXT,
  ADD COLUMN "paymentTermsDays" INTEGER NOT NULL DEFAULT 30;

CREATE TABLE "customers" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "userId" TEXT,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT,
  "companyName" TEXT,
  "gstin" TEXT,
  "billingAddress" TEXT,
  "city" TEXT,
  "state" TEXT,
  "pincode" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "quotation_templates" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "validForDays" INTEGER NOT NULL DEFAULT 30,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "quotation_templates_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "quotation_template_lines" (
  "id" TEXT NOT NULL,
  "quotationTemplateId" TEXT NOT NULL,
  "productVariantId" TEXT,
  "description" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL DEFAULT 1,
  "unitPrice" DECIMAL(12,2) NOT NULL,
  "discountPct" DECIMAL(5,2) NOT NULL DEFAULT 0,
  "taxRate" DECIMAL(5,2) NOT NULL DEFAULT 18,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "quotation_template_lines_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "subscription_history" (
  "id" TEXT NOT NULL,
  "subscriptionId" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "fromStatus" "SubscriptionStatus",
  "toStatus" "SubscriptionStatus" NOT NULL,
  "reason" TEXT,
  "changedById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "subscription_history_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "discount_redemptions" (
  "id" TEXT NOT NULL,
  "discountId" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "customerId" TEXT,
  "invoiceId" TEXT,
  "amount" DECIMAL(12,2) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "discount_redemptions_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "organization_settings" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'INR',
  "timezone" TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  "invoicePrefix" TEXT NOT NULL DEFAULT 'INV',
  "notificationPreferences" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "organization_settings_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "notifications" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "userId" TEXT,
  "type" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "readAt" TIMESTAMP(3),
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "billing_runs" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT,
  "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP(3),
  "status" TEXT NOT NULL DEFAULT 'RUNNING',
  "subscriptionsProcessed" INTEGER NOT NULL DEFAULT 0,
  "invoicesCreated" INTEGER NOT NULL DEFAULT 0,
  "failures" JSONB,
  CONSTRAINT "billing_runs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "customers_organizationId_idx" ON "customers"("organizationId");
CREATE INDEX "customers_userId_idx" ON "customers"("userId");
CREATE UNIQUE INDEX "customers_organizationId_email_key" ON "customers"("organizationId", "email");
CREATE INDEX "quotation_templates_organizationId_idx" ON "quotation_templates"("organizationId");
CREATE UNIQUE INDEX "quotation_templates_organizationId_name_key" ON "quotation_templates"("organizationId", "name");
CREATE INDEX "quotation_template_lines_quotationTemplateId_idx" ON "quotation_template_lines"("quotationTemplateId");
CREATE INDEX "subscription_history_subscriptionId_createdAt_idx" ON "subscription_history"("subscriptionId", "createdAt");
CREATE INDEX "subscription_history_organizationId_createdAt_idx" ON "subscription_history"("organizationId", "createdAt");
CREATE INDEX "discount_redemptions_discountId_customerId_idx" ON "discount_redemptions"("discountId", "customerId");
CREATE INDEX "discount_redemptions_organizationId_createdAt_idx" ON "discount_redemptions"("organizationId", "createdAt");
CREATE UNIQUE INDEX "organization_settings_organizationId_key" ON "organization_settings"("organizationId");
CREATE INDEX "notifications_organizationId_createdAt_idx" ON "notifications"("organizationId", "createdAt");
CREATE INDEX "notifications_userId_readAt_idx" ON "notifications"("userId", "readAt");
CREATE INDEX "billing_runs_organizationId_startedAt_idx" ON "billing_runs"("organizationId", "startedAt");
CREATE INDEX "discounts_productId_idx" ON "discounts"("productId");
CREATE INDEX "invoices_customerId_idx" ON "invoices"("customerId");
CREATE UNIQUE INDEX "invoices_organizationId_number_key" ON "invoices"("organizationId", "number");
CREATE UNIQUE INDEX "invoices_subscriptionId_periodStart_key" ON "invoices"("subscriptionId", "periodStart");
CREATE UNIQUE INDEX "payments_organizationId_number_key" ON "payments"("organizationId", "number");
CREATE INDEX "quotations_customerId_idx" ON "quotations"("customerId");
CREATE UNIQUE INDEX "quotations_organizationId_number_key" ON "quotations"("organizationId", "number");
CREATE INDEX "subscriptions_customerId_idx" ON "subscriptions"("customerId");
CREATE UNIQUE INDEX "subscriptions_organizationId_number_key" ON "subscriptions"("organizationId", "number");

ALTER TABLE "customers" ADD CONSTRAINT "customers_organizationId_fkey"
  FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "customers" ADD CONSTRAINT "customers_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_customerId_fkey"
  FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "quotation_templates" ADD CONSTRAINT "quotation_templates_organizationId_fkey"
  FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "quotation_template_lines" ADD CONSTRAINT "quotation_template_lines_quotationTemplateId_fkey"
  FOREIGN KEY ("quotationTemplateId") REFERENCES "quotation_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_customerId_fkey"
  FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "subscription_history" ADD CONSTRAINT "subscription_history_subscriptionId_fkey"
  FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_customerId_fkey"
  FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "discounts" ADD CONSTRAINT "discounts_productId_fkey"
  FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "discount_redemptions" ADD CONSTRAINT "discount_redemptions_discountId_fkey"
  FOREIGN KEY ("discountId") REFERENCES "discounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "discount_redemptions" ADD CONSTRAINT "discount_redemptions_customerId_fkey"
  FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "discount_redemptions" ADD CONSTRAINT "discount_redemptions_invoiceId_fkey"
  FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "organization_settings" ADD CONSTRAINT "organization_settings_organizationId_fkey"
  FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_organizationId_fkey"
  FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "billing_runs" ADD CONSTRAINT "billing_runs_organizationId_fkey"
  FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

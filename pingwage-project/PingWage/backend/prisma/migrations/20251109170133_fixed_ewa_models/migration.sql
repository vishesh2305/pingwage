-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('worker', 'employer_admin', 'super_admin');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('active', 'suspended', 'banned');

-- CreateEnum
CREATE TYPE "AdvanceSpeed" AS ENUM ('instant', 'same_day', 'next_day');

-- CreateEnum
CREATE TYPE "AdvanceStatus" AS ENUM ('pending', 'processing', 'completed', 'failed');

-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('stripe', 'postfinance');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('pending', 'paid', 'overdue');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "email" VARCHAR(255),
    "pin_hash" VARCHAR(255),
    "password_hash" VARCHAR(255),
    "role" "UserRole" NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "worker_profiles" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "employer_id" UUID,
    "first_name" VARCHAR(100),
    "last_name" VARCHAR(100),
    "date_of_birth" DATE,
    "employee_id" VARCHAR(50),
    "department" VARCHAR(100),
    "hourly_rate" DECIMAL(10,2),
    "profile_photo_url" TEXT,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL,

    CONSTRAINT "worker_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bank_accounts" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "iban" VARCHAR(50) NOT NULL,
    "bank_name" VARCHAR(100),
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL,

    CONSTRAINT "bank_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employers" (
    "id" UUID NOT NULL,
    "company_name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "tax_id" VARCHAR(50),
    "logo_url" TEXT,
    "settings" JSONB,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL,
    "advance_rate" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "pay_period_frequency" TEXT NOT NULL DEFAULT 'weekly',
    "pay_period_end_day" TEXT,

    CONSTRAINT "employers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "earnings" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "employer_id" UUID NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "date" DATE NOT NULL,
    "notes" VARCHAR(255),
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "earnings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "advances" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "employer_id" UUID,
    "amount" DECIMAL(10,2) NOT NULL,
    "fee" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(10,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'CHF',
    "speed" "AdvanceSpeed",
    "status" "AdvanceStatus" NOT NULL DEFAULT 'pending',
    "bank_account_id" UUID NOT NULL,
    "payment_id" VARCHAR(255),
    "payment_provider" "PaymentProvider",
    "idempotency_key" VARCHAR(255),
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "failure_reason" TEXT,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMP,
    "completed_at" TIMESTAMP,

    CONSTRAINT "advances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "title" VARCHAR(255),
    "message" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" UUID NOT NULL,
    "employer_id" UUID,
    "period" VARCHAR(10),
    "amount" DECIMAL(10,2) NOT NULL,
    "breakdown" JSONB,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'pending',
    "payment_id" VARCHAR(255),
    "paid_at" TIMESTAMP,
    "due_date" DATE,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "action" VARCHAR(100) NOT NULL,
    "entity_type" VARCHAR(50),
    "entity_id" UUID,
    "ip_address" VARCHAR(50),
    "user_agent" TEXT,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_syncs" (
    "id" UUID NOT NULL,
    "employer_id" UUID,
    "status" VARCHAR(20) NOT NULL DEFAULT 'processing',
    "records_processed" INTEGER,
    "started_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP,

    CONSTRAINT "payroll_syncs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_codes" (
    "id" UUID NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "code" VARCHAR(10) NOT NULL,
    "expires_at" TIMESTAMP NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verification_codes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "worker_profiles_user_id_key" ON "worker_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "employers_email_key" ON "employers"("email");

-- CreateIndex
CREATE INDEX "earnings_user_id_idx" ON "earnings"("user_id");

-- CreateIndex
CREATE INDEX "earnings_date_idx" ON "earnings"("date");

-- CreateIndex
CREATE UNIQUE INDEX "advances_idempotency_key_key" ON "advances"("idempotency_key");

-- CreateIndex
CREATE INDEX "advances_user_id_idx" ON "advances"("user_id");

-- CreateIndex
CREATE INDEX "advances_status_idx" ON "advances"("status");

-- CreateIndex
CREATE INDEX "advances_created_at_idx" ON "advances"("created_at");

-- CreateIndex
CREATE INDEX "notifications_user_id_idx" ON "notifications"("user_id");

-- CreateIndex
CREATE INDEX "verification_codes_phone_idx" ON "verification_codes"("phone");

-- AddForeignKey
ALTER TABLE "worker_profiles" ADD CONSTRAINT "worker_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_profiles" ADD CONSTRAINT "worker_profiles_employer_id_fkey" FOREIGN KEY ("employer_id") REFERENCES "employers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_accounts" ADD CONSTRAINT "bank_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "earnings" ADD CONSTRAINT "earnings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "earnings" ADD CONSTRAINT "earnings_employer_id_fkey" FOREIGN KEY ("employer_id") REFERENCES "employers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "advances" ADD CONSTRAINT "advances_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "advances" ADD CONSTRAINT "advances_employer_id_fkey" FOREIGN KEY ("employer_id") REFERENCES "employers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "advances" ADD CONSTRAINT "advances_bank_account_id_fkey" FOREIGN KEY ("bank_account_id") REFERENCES "bank_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_employer_id_fkey" FOREIGN KEY ("employer_id") REFERENCES "employers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_syncs" ADD CONSTRAINT "payroll_syncs_employer_id_fkey" FOREIGN KEY ("employer_id") REFERENCES "employers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

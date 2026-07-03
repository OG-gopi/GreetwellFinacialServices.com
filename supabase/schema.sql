-- GFS – Greetwell Financial Services
-- Complete PostgreSQL Schema with Row Level Security
-- Version: 1.0.0
-- Run this in: Supabase Dashboard > SQL Editor

-- ─────────────────────────────────────────────
-- EXTENSIONS
-- ─────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─────────────────────────────────────────────
-- TYPES / ENUMS
-- ─────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM (
    'superadmin','loan_admin','insurance_admin','investment_admin',
    'loan_agent','insurance_agent','investment_agent'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE module_type AS ENUM ('loans','insurance','investments','all');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE loan_type AS ENUM ('personal','education','business','home','vehicle');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE loan_status AS ENUM ('lead','verification','approved','disbursed','closed','rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE insurance_type AS ENUM ('health','life','vehicle','property','travel');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE policy_status AS ENUM ('active','expired','cancelled','pending','claimed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE claim_status AS ENUM ('filed','under_review','approved','rejected','settled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE investment_type AS ENUM ('mutual_fund','sip','stocks','fixed_deposit','bonds');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE risk_level AS ENUM ('low','medium','high');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE investment_status AS ENUM ('active','matured','withdrawn','paused');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE document_type AS ENUM ('aadhaar','pan','salary_slip','bank_statement','photo','other');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE notification_type AS ENUM ('info','success','warning','error','reminder');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─────────────────────────────────────────────
-- BRANCHES
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS branches (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         TEXT NOT NULL,
  city         TEXT NOT NULL,
  state        TEXT NOT NULL,
  address      TEXT,
  manager_id   UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_active    BOOLEAN DEFAULT TRUE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- PROFILES (extends auth.users)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     TEXT NOT NULL,
  email         TEXT NOT NULL,
  phone         TEXT,
  role          user_role NOT NULL DEFAULT 'loan_agent',
  module        module_type NOT NULL DEFAULT 'loans',
  branch_id     UUID REFERENCES branches(id) ON DELETE SET NULL,
  avatar_url    TEXT,
  is_active     BOOLEAN DEFAULT TRUE,
  is_blocked    BOOLEAN DEFAULT FALSE,
  last_login    TIMESTAMPTZ,
  created_by    UUID REFERENCES auth.users(id),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- CUSTOMERS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS customers (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name        TEXT NOT NULL,
  email            TEXT,
  phone            TEXT NOT NULL,
  alternate_phone  TEXT,
  aadhaar          TEXT,
  pan              TEXT,
  date_of_birth    DATE,
  gender           TEXT CHECK (gender IN ('male','female','other')),
  address          TEXT,
  city             TEXT,
  state            TEXT,
  pincode          TEXT,
  occupation       TEXT,
  employer         TEXT,
  monthly_income   NUMERIC(15,2),
  cibil_score      INTEGER CHECK (cibil_score BETWEEN 300 AND 900),
  bank_name        TEXT,
  account_number   TEXT,
  ifsc_code        TEXT,
  agent_id         UUID NOT NULL REFERENCES profiles(user_id),
  branch_id        UUID REFERENCES branches(id),
  module           module_type NOT NULL DEFAULT 'loans',
  notes            TEXT,
  is_deleted       BOOLEAN DEFAULT FALSE,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- LOANS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS loans (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id        UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  loan_type          loan_type NOT NULL,
  loan_amount        NUMERIC(15,2) NOT NULL,
  interest_rate      NUMERIC(5,2) NOT NULL DEFAULT 10.5,
  tenure_months      INTEGER NOT NULL,
  emi_amount         NUMERIC(15,2),
  status             loan_status NOT NULL DEFAULT 'lead',
  agent_id           UUID NOT NULL REFERENCES profiles(user_id),
  admin_id           UUID REFERENCES profiles(user_id),
  branch_id          UUID REFERENCES branches(id),
  purpose            TEXT,
  disbursement_date  DATE,
  remarks            TEXT,
  rejection_reason   TEXT,
  is_deleted         BOOLEAN DEFAULT FALSE,
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at         TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- INSURANCE POLICIES
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS insurance_policies (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id         UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  policy_number       TEXT UNIQUE NOT NULL,
  insurance_type      insurance_type NOT NULL,
  provider            TEXT NOT NULL,
  sum_assured         NUMERIC(15,2) NOT NULL,
  premium_amount      NUMERIC(15,2) NOT NULL,
  premium_frequency   TEXT CHECK (premium_frequency IN ('monthly','quarterly','annually')) DEFAULT 'annually',
  start_date          DATE NOT NULL,
  end_date            DATE NOT NULL,
  status              policy_status NOT NULL DEFAULT 'pending',
  agent_id            UUID NOT NULL REFERENCES profiles(user_id),
  admin_id            UUID REFERENCES auth.users(id),
  branch_id           UUID REFERENCES branches(id),
  next_renewal_date   DATE,
  is_deleted          BOOLEAN DEFAULT FALSE,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- INSURANCE CLAIMS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS insurance_claims (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  policy_id         UUID NOT NULL REFERENCES insurance_policies(id) ON DELETE CASCADE,
  customer_id       UUID NOT NULL REFERENCES customers(id),
  claim_amount      NUMERIC(15,2) NOT NULL,
  claim_date        DATE NOT NULL DEFAULT CURRENT_DATE,
  status            claim_status NOT NULL DEFAULT 'filed',
  description       TEXT,
  settlement_amount NUMERIC(15,2),
  settled_date      DATE,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- INVESTMENTS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS investments (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id       UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  investment_type   investment_type NOT NULL,
  fund_name         TEXT,
  invested_amount   NUMERIC(15,2) NOT NULL,
  current_value     NUMERIC(15,2),
  returns_amount    NUMERIC(15,2) GENERATED ALWAYS AS (COALESCE(current_value,0) - invested_amount) STORED,
  risk_level        risk_level NOT NULL DEFAULT 'medium',
  start_date        DATE NOT NULL,
  maturity_date     DATE,
  status            investment_status NOT NULL DEFAULT 'active',
  sip_amount        NUMERIC(15,2),
  sip_frequency     TEXT CHECK (sip_frequency IN ('weekly','monthly','quarterly')),
  agent_id          UUID NOT NULL REFERENCES profiles(user_id),
  admin_id          UUID REFERENCES auth.users(id),
  branch_id         UUID REFERENCES branches(id),
  is_deleted        BOOLEAN DEFAULT FALSE,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- DOCUMENTS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS documents (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id   UUID REFERENCES customers(id) ON DELETE CASCADE,
  loan_id       UUID REFERENCES loans(id) ON DELETE CASCADE,
  policy_id     UUID REFERENCES insurance_policies(id) ON DELETE CASCADE,
  investment_id UUID REFERENCES investments(id) ON DELETE CASCADE,
  doc_type      document_type NOT NULL DEFAULT 'other',
  file_name     TEXT NOT NULL,
  file_url      TEXT NOT NULL,
  file_size     INTEGER,
  mime_type     TEXT,
  uploaded_by   UUID NOT NULL REFERENCES auth.users(id),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- ACTIVITY LOGS / AUDIT
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS activity_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id),
  action      TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id   UUID,
  old_value   JSONB,
  new_value   JSONB,
  ip_address  INET,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- LOGIN HISTORY
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS login_history (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id),
  ip_address  INET,
  device      TEXT,
  browser     TEXT,
  location    TEXT,
  success     BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- NOTIFICATIONS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  message     TEXT NOT NULL,
  type        notification_type NOT NULL DEFAULT 'info',
  is_read     BOOLEAN DEFAULT FALSE,
  link        TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- FOLLOW-UPS (CRM)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS follow_ups (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id     UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  agent_id        UUID NOT NULL REFERENCES profiles(user_id),
  scheduled_at    TIMESTAMPTZ NOT NULL,
  notes           TEXT,
  is_completed    BOOLEAN DEFAULT FALSE,
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- NOTES (CRM)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notes (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  agent_id    UUID NOT NULL REFERENCES profiles(user_id),
  content     TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_customers_agent_id ON customers(agent_id);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_loans_agent_id ON loans(agent_id);
CREATE INDEX IF NOT EXISTS idx_loans_status ON loans(status);
CREATE INDEX IF NOT EXISTS idx_loans_customer_id ON loans(customer_id);
CREATE INDEX IF NOT EXISTS idx_insurance_agent_id ON insurance_policies(agent_id);
CREATE INDEX IF NOT EXISTS idx_insurance_status ON insurance_policies(status);
CREATE INDEX IF NOT EXISTS idx_investments_agent_id ON investments(agent_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_follow_ups_agent_id ON follow_ups(agent_id);
CREATE INDEX IF NOT EXISTS idx_follow_ups_scheduled ON follow_ups(scheduled_at);

-- ─────────────────────────────────────────────
-- UPDATED_AT TRIGGER
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER trg_customers_updated_at
  BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER trg_loans_updated_at
  BEFORE UPDATE ON loans FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER trg_insurance_updated_at
  BEFORE UPDATE ON insurance_policies FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER trg_investments_updated_at
  BEFORE UPDATE ON investments FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─────────────────────────────────────────────
-- AUTO-CREATE PROFILE ON USER SIGNUP (With privilege escalation protection)
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role user_role;
  v_module module_type;
  v_meta_role text;
BEGIN
  -- Read role from metadata
  v_meta_role := NEW.raw_user_meta_data->>'role';
  
  -- Force fallback: only allow agent roles via self-signup to prevent privilege escalation
  IF v_meta_role IS NOT NULL AND v_meta_role IN ('loan_agent', 'insurance_agent', 'investment_agent') THEN
    v_role := v_meta_role::user_role;
  ELSE
    v_role := 'loan_agent'::user_role;
  END IF;

  -- Determine module based on role
  IF v_role = 'loan_agent' THEN
    v_module := 'loans';
  ELSIF v_role = 'insurance_agent' THEN
    v_module := 'insurance';
  ELSIF v_role = 'investment_agent' THEN
    v_module := 'investments';
  ELSE
    v_module := 'loans';
  END IF;

  INSERT INTO profiles (user_id, full_name, email, role, module)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email,
    v_role,
    v_module
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─────────────────────────────────────────────
-- PROFILE MODIFICATION SECURITY (Prevent Self-Role Escalation)
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION check_profile_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Bypass checks for direct database updates (e.g. from SQL Editor / database migrations)
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  -- Prevent updating role, module, is_active, is_blocked, or email by non-superadmins
  IF (OLD.role IS DISTINCT FROM NEW.role OR
      OLD.module IS DISTINCT FROM NEW.module OR
      OLD.is_active IS DISTINCT FROM NEW.is_active OR
      OLD.is_blocked IS DISTINCT FROM NEW.is_blocked OR
      OLD.email IS DISTINCT FROM NEW.email) THEN
    
    IF NOT is_superadmin() THEN
      RAISE EXCEPTION 'Access Denied: You do not have permission to modify sensitive profile fields.';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE TRIGGER trg_check_profile_changes
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION check_profile_changes();

-- ─────────────────────────────────────────────
-- LOAN STATUS SECURITY (Only Loan Admin/Superadmin can approve/reject/disburse)
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION check_loan_status_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Bypass checks for direct database updates
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- Only loan_admin or superadmin can change loan status to approved, disbursed, closed, or rejected
    IF NEW.status IN ('approved', 'disbursed', 'closed', 'rejected') THEN
      IF get_my_role() NOT IN ('superadmin', 'loan_admin') THEN
        RAISE EXCEPTION 'Access Denied: Only Loan Admins or Super Admins can approve, reject, disburse, or close loans.';
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE TRIGGER trg_check_loan_status_update
  BEFORE UPDATE ON loans
  FOR EACH ROW
  EXECUTE FUNCTION check_loan_status_update();

-- ─────────────────────────────────────────────
-- INSURANCE STATUS SECURITY (Only Insurance Admin/Superadmin can activate/cancel/claim)
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION check_insurance_status_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Bypass checks for direct database updates
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- Only insurance_admin or superadmin can change insurance policy status to active, cancelled, or claimed
    IF NEW.status IN ('active', 'cancelled', 'claimed') THEN
      IF get_my_role() NOT IN ('superadmin', 'insurance_admin') THEN
        RAISE EXCEPTION 'Access Denied: Only Insurance Admins or Super Admins can activate, cancel, or process claims for policies.';
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE TRIGGER trg_check_insurance_status_update
  BEFORE UPDATE ON insurance_policies
  FOR EACH ROW
  EXECUTE FUNCTION check_insurance_status_update();

-- ─────────────────────────────────────────────
-- ENABLE ROW LEVEL SECURITY
-- ─────────────────────────────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE follow_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────
-- HELPER FUNCTION: GET CURRENT USER ROLE
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION is_superadmin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS(SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'superadmin');
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION is_any_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS(SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN (
    'superadmin','loan_admin','insurance_admin','investment_admin'
  ));
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- ─────────────────────────────────────────────
-- FUNCTION OWNERSHIP (ensures SECURITY DEFINER runs as superuser, bypassing RLS)
-- ─────────────────────────────────────────────
ALTER FUNCTION public.handle_new_user() OWNER TO postgres;
ALTER FUNCTION public.get_my_role() OWNER TO postgres;
ALTER FUNCTION public.is_superadmin() OWNER TO postgres;
ALTER FUNCTION public.is_any_admin() OWNER TO postgres;
ALTER FUNCTION public.check_profile_changes() OWNER TO postgres;
ALTER FUNCTION public.check_loan_status_update() OWNER TO postgres;
ALTER FUNCTION public.check_insurance_status_update() OWNER TO postgres;

-- ─────────────────────────────────────────────
-- RLS POLICIES: PROFILES
-- ─────────────────────────────────────────────
DROP POLICY IF EXISTS "profiles_select" ON profiles;
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (
  user_id = auth.uid() OR is_superadmin() OR is_any_admin()
);

DROP POLICY IF EXISTS "profiles_insert" ON profiles;
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (
  -- auth.uid() IS NULL allows the handle_new_user trigger to insert during signup
  -- (GoTrue executes the trigger before a session is established)
  auth.uid() IS NULL OR user_id = auth.uid() OR is_superadmin()
);

DROP POLICY IF EXISTS "profiles_update" ON profiles;
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (
  user_id = auth.uid() OR is_superadmin()
);

-- ─────────────────────────────────────────────
-- RLS POLICIES: BRANCHES
-- ─────────────────────────────────────────────
DROP POLICY IF EXISTS "branches_select" ON branches;
CREATE POLICY "branches_select" ON branches FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "branches_modify" ON branches;
CREATE POLICY "branches_modify" ON branches FOR ALL USING (is_superadmin());

-- ─────────────────────────────────────────────
-- RLS POLICIES: CUSTOMERS
-- ─────────────────────────────────────────────
CREATE POLICY "customers_select" ON customers FOR SELECT USING (TRUE);

CREATE POLICY "customers_insert" ON customers FOR INSERT WITH CHECK (TRUE);

DROP POLICY IF EXISTS "customers_update" ON customers;
CREATE POLICY "customers_update" ON customers FOR UPDATE USING (
  agent_id = auth.uid() OR is_any_admin()
);

-- ─────────────────────────────────────────────
-- RLS POLICIES: LOANS
-- ─────────────────────────────────────────────
DROP POLICY IF EXISTS "loans_select" ON loans;
CREATE POLICY "loans_select" ON loans FOR SELECT USING (
  is_deleted = FALSE AND (
    agent_id = auth.uid()
    OR is_superadmin()
    OR get_my_role() = 'loan_admin'
  )
);

DROP POLICY IF EXISTS "loans_insert" ON loans;
CREATE POLICY "loans_insert" ON loans FOR INSERT WITH CHECK (
  agent_id = auth.uid() OR get_my_role() IN ('superadmin','loan_admin')
);

DROP POLICY IF EXISTS "loans_update" ON loans;
CREATE POLICY "loans_update" ON loans FOR UPDATE USING (
  agent_id = auth.uid() OR get_my_role() IN ('superadmin','loan_admin')
);

-- ─────────────────────────────────────────────
-- RLS POLICIES: INSURANCE
-- ─────────────────────────────────────────────
DROP POLICY IF EXISTS "insurance_select" ON insurance_policies;
CREATE POLICY "insurance_select" ON insurance_policies FOR SELECT USING (
  is_deleted = FALSE AND (
    agent_id = auth.uid()
    OR is_superadmin()
    OR get_my_role() = 'insurance_admin'
  )
);

DROP POLICY IF EXISTS "insurance_insert" ON insurance_policies;
CREATE POLICY "insurance_insert" ON insurance_policies FOR INSERT WITH CHECK (
  agent_id = auth.uid() OR get_my_role() IN ('superadmin','insurance_admin')
);

DROP POLICY IF EXISTS "insurance_update" ON insurance_policies;
CREATE POLICY "insurance_update" ON insurance_policies FOR UPDATE USING (
  agent_id = auth.uid() OR get_my_role() IN ('superadmin','insurance_admin')
);

-- ─────────────────────────────────────────────
-- RLS POLICIES: INVESTMENTS
-- ─────────────────────────────────────────────
DROP POLICY IF EXISTS "investments_select" ON investments;
CREATE POLICY "investments_select" ON investments FOR SELECT USING (
  is_deleted = FALSE AND (
    agent_id = auth.uid()
    OR is_superadmin()
    OR get_my_role() = 'investment_admin'
  )
);

DROP POLICY IF EXISTS "investments_insert" ON investments;
CREATE POLICY "investments_insert" ON investments FOR INSERT WITH CHECK (
  agent_id = auth.uid() OR get_my_role() IN ('superadmin','investment_admin')
);

DROP POLICY IF EXISTS "investments_update" ON investments;
CREATE POLICY "investments_update" ON investments FOR UPDATE USING (
  agent_id = auth.uid() OR get_my_role() IN ('superadmin','investment_admin')
);

-- ─────────────────────────────────────────────
-- RLS POLICIES: DOCUMENTS
-- ─────────────────────────────────────────────
DROP POLICY IF EXISTS "documents_select" ON documents;
CREATE POLICY "documents_select" ON documents FOR SELECT USING (
  uploaded_by = auth.uid() OR is_any_admin()
);

DROP POLICY IF EXISTS "documents_insert" ON documents;
CREATE POLICY "documents_insert" ON documents FOR INSERT WITH CHECK (
  uploaded_by = auth.uid()
);

-- ─────────────────────────────────────────────
-- RLS POLICIES: ACTIVITY LOGS
-- ─────────────────────────────────────────────
DROP POLICY IF EXISTS "activity_logs_select" ON activity_logs;
CREATE POLICY "activity_logs_select" ON activity_logs FOR SELECT USING (
  user_id = auth.uid() OR is_superadmin()
);

DROP POLICY IF EXISTS "activity_logs_insert" ON activity_logs;
CREATE POLICY "activity_logs_insert" ON activity_logs FOR INSERT WITH CHECK (
  user_id = auth.uid()
);

-- ─────────────────────────────────────────────
-- RLS POLICIES: LOGIN HISTORY
-- ─────────────────────────────────────────────
DROP POLICY IF EXISTS "login_history_select" ON login_history;
CREATE POLICY "login_history_select" ON login_history FOR SELECT USING (
  user_id = auth.uid() OR is_superadmin()
);

DROP POLICY IF EXISTS "login_history_insert" ON login_history;
CREATE POLICY "login_history_insert" ON login_history FOR INSERT WITH CHECK (TRUE);

-- ─────────────────────────────────────────────
-- RLS POLICIES: NOTIFICATIONS
-- ─────────────────────────────────────────────
DROP POLICY IF EXISTS "notifications_select" ON notifications;
CREATE POLICY "notifications_select" ON notifications FOR SELECT USING (
  user_id = auth.uid()
);

DROP POLICY IF EXISTS "notifications_update" ON notifications;
CREATE POLICY "notifications_update" ON notifications FOR UPDATE USING (
  user_id = auth.uid()
);

-- ─────────────────────────────────────────────
-- RLS POLICIES: FOLLOW-UPS & NOTES
-- ─────────────────────────────────────────────
DROP POLICY IF EXISTS "followups_select" ON follow_ups;
CREATE POLICY "followups_select" ON follow_ups FOR SELECT USING (
  agent_id = auth.uid() OR is_any_admin()
);
DROP POLICY IF EXISTS "followups_insert" ON follow_ups;
CREATE POLICY "followups_insert" ON follow_ups FOR INSERT WITH CHECK (agent_id = auth.uid());
DROP POLICY IF EXISTS "followups_update" ON follow_ups;
CREATE POLICY "followups_update" ON follow_ups FOR UPDATE USING (agent_id = auth.uid());

DROP POLICY IF EXISTS "notes_select" ON notes;
CREATE POLICY "notes_select" ON notes FOR SELECT USING (agent_id = auth.uid() OR is_any_admin());
DROP POLICY IF EXISTS "notes_insert" ON notes;
CREATE POLICY "notes_insert" ON notes FOR INSERT WITH CHECK (agent_id = auth.uid());

-- ─────────────────────────────────────────────
-- SEED: BRANCHES
-- ─────────────────────────────────────────────
INSERT INTO branches (name, city, state) VALUES
  ('GFS Head Office', 'Mumbai', 'Maharashtra'),
  ('GFS Delhi NCR', 'New Delhi', 'Delhi'),
  ('GFS Bangalore', 'Bangalore', 'Karnataka'),
  ('GFS Chennai', 'Chennai', 'Tamil Nadu'),
  ('GFS Hyderabad', 'Hyderabad', 'Telangana'),
  ('GFS Pune', 'Pune', 'Maharashtra'),
  ('GFS Ahmedabad', 'Ahmedabad', 'Gujarat'),
  ('GFS Kolkata', 'Kolkata', 'West Bengal')
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────
-- SEED: SUPERADMIN (Update email before running)
-- ─────────────────────────────────────────────
-- After creating your Supabase account, update the user's role manually:
-- UPDATE profiles SET role = 'superadmin', module = 'all' WHERE email = 'your-admin@email.com';

-- ─────────────────────────────────────────────
-- STORAGE: Create bucket for documents
-- ─────────────────────────────────────────────
-- Run in Supabase Dashboard > Storage:
-- Create bucket named 'gfs-documents' with private access
-- Then add policy: Allow authenticated users to upload to their own folder

-- ─────────────────────────────────────────────
-- REALTIME: Enable for notifications
-- ─────────────────────────────────────────────
-- In Supabase Dashboard > Database > Replication:
-- Enable realtime for: notifications, loans, insurance_policies, investments

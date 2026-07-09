-- ============================================================
-- AssetPro Enterprise - PostgreSQL Schema
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE user_role AS ENUM ('admin', 'employee');
CREATE TYPE asset_status AS ENUM ('available', 'assigned', 'in_repair', 'disposed', 'pending_return');
CREATE TYPE asset_category AS ENUM ('laptop', 'monitor', 'mobile', 'peripheral', 'infrastructure', 'furniture', 'other');
CREATE TYPE asset_condition AS ENUM ('excellent', 'good', 'fair', 'poor');
CREATE TYPE request_status AS ENUM ('pending', 'approved', 'rejected', 'completed', 'cancelled');
CREATE TYPE maintenance_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');
CREATE TYPE maintenance_type AS ENUM ('hardware_repair', 'software_update', 'routine_check', 'inspection', 'replacement');
CREATE TYPE assignment_status AS ENUM ('active', 'overdue', 'returned');
CREATE TYPE return_status AS ENUM ('pending', 'approved', 'received', 'inspected', 'completed');
CREATE TYPE employee_status AS ENUM ('active', 'inactive', 'on_leave');
CREATE TYPE notification_type AS ENUM ('assignment', 'request', 'maintenance', 'return', 'system');

-- ============================================================
-- DEPARTMENTS
-- ============================================================

CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- USERS
-- ============================================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'employee',
  employee_id VARCHAR(50) UNIQUE,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  position VARCHAR(100),
  phone VARCHAR(30),
  work_location VARCHAR(150),
  status employee_status NOT NULL DEFAULT 'active',
  two_factor_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  avatar_url TEXT,
  joined_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ASSETS
-- ============================================================

CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(200) NOT NULL,
  asset_tag VARCHAR(100) NOT NULL UNIQUE,
  serial_number VARCHAR(100) UNIQUE,
  category asset_category NOT NULL,
  status asset_status NOT NULL DEFAULT 'available',
  condition asset_condition NOT NULL DEFAULT 'good',
  purchase_date DATE,
  purchase_cost NUMERIC(12, 2),
  warranty_expiry DATE,
  vendor VARCHAR(150),
  location VARCHAR(150),
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ASSET ASSIGNMENTS
-- ============================================================

CREATE TABLE asset_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE RESTRICT,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
  assigned_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expected_return_date DATE,
  actual_return_date DATE,
  status assignment_status NOT NULL DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ASSET REQUESTS
-- ============================================================

CREATE TABLE asset_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requested_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  asset_name VARCHAR(200) NOT NULL,
  category asset_category,
  reason TEXT NOT NULL,
  status request_status NOT NULL DEFAULT 'pending',
  admin_comment TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- MAINTENANCE LOGS
-- ============================================================

CREATE TABLE maintenance_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  reported_by UUID REFERENCES users(id) ON DELETE SET NULL,
  technician_id UUID REFERENCES users(id) ON DELETE SET NULL,
  type maintenance_type NOT NULL,
  description TEXT NOT NULL,
  cost NUMERIC(10, 2) DEFAULT 0.00,
  status maintenance_status NOT NULL DEFAULT 'pending',
  scheduled_date DATE,
  completed_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ASSET RETURNS
-- ============================================================

CREATE TABLE asset_returns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID NOT NULL REFERENCES asset_assignments(id) ON DELETE CASCADE,
  requested_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  processed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  condition_on_return asset_condition,
  return_notes TEXT,
  status return_status NOT NULL DEFAULT 'pending',
  return_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ACTIVITIES (Audit Log)
-- ============================================================

CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  asset_id UUID REFERENCES assets(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  reference_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_department ON users(department_id);
CREATE INDEX idx_users_role ON users(role);

CREATE INDEX idx_assets_status ON assets(status);
CREATE INDEX idx_assets_category ON assets(category);
CREATE INDEX idx_assets_tag ON assets(asset_tag);

CREATE INDEX idx_assignments_asset ON asset_assignments(asset_id);
CREATE INDEX idx_assignments_user ON asset_assignments(user_id);
CREATE INDEX idx_assignments_status ON asset_assignments(status);

CREATE INDEX idx_requests_user ON asset_requests(requested_by);
CREATE INDEX idx_requests_status ON asset_requests(status);

CREATE INDEX idx_maintenance_asset ON maintenance_logs(asset_id);
CREATE INDEX idx_maintenance_status ON maintenance_logs(status);

CREATE INDEX idx_returns_assignment ON asset_returns(assignment_id);
CREATE INDEX idx_returns_status ON asset_returns(status);

CREATE INDEX idx_activities_user ON activities(user_id);
CREATE INDEX idx_activities_asset ON activities(asset_id);
CREATE INDEX idx_activities_created ON activities(created_at DESC);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(user_id, is_read);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_assets_updated_at BEFORE UPDATE ON assets FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_assignments_updated_at BEFORE UPDATE ON asset_assignments FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_requests_updated_at BEFORE UPDATE ON asset_requests FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_maintenance_updated_at BEFORE UPDATE ON maintenance_logs FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_returns_updated_at BEFORE UPDATE ON asset_returns FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- SEED DATA
-- ============================================================

-- Departments
INSERT INTO departments (name) VALUES
  ('Engineering'),
  ('HR'),
  ('Finance'),
  ('Operations'),
  ('Marketing'),
  ('Sales'),
  ('Design'),
  ('IT');

-- Admin user (password: 1234567)
INSERT INTO users (first_name, last_name, email, password_hash, role, employee_id, position, status)
VALUES (
  'Admin', 'User',
  'arsemaarse51@gmail.com',
  crypt('1234567', gen_salt('bf')),
  'admin',
  'EMP-0001',
  'System Administrator',
  'active'
);

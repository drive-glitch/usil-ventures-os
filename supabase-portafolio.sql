-- ============================================================
-- PORTAFOLIO MODULE — PHASE 1 SCHEMA
-- Run in Supabase SQL Editor
-- Safe: all ALTER ADD columns are nullable (no breaking changes)
-- ============================================================

-- ------------------------------------------------------------
-- 1. EXTEND existing startups table (non-breaking additions)
-- ------------------------------------------------------------
ALTER TABLE startups
  ADD COLUMN IF NOT EXISTS normalized_name     TEXT,
  ADD COLUMN IF NOT EXISTS legal_name          TEXT,
  ADD COLUMN IF NOT EXISTS city                TEXT,
  ADD COLUMN IF NOT EXISTS subsector           TEXT,
  ADD COLUMN IF NOT EXISTS business_model      TEXT,
  ADD COLUMN IF NOT EXISTS stage               TEXT,
  ADD COLUMN IF NOT EXISTS current_status      TEXT DEFAULT 'activa',
  ADD COLUMN IF NOT EXISTS revenue_latest      NUMERIC(14,2),
  ADD COLUMN IF NOT EXISTS revenue_currency    TEXT DEFAULT 'PEN',
  ADD COLUMN IF NOT EXISTS funding_total       NUMERIC(14,2),
  ADD COLUMN IF NOT EXISTS funding_currency    TEXT DEFAULT 'PEN',
  ADD COLUMN IF NOT EXISTS has_softlanding     BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_revenue         BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_funding         BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS owner_uv            TEXT,
  ADD COLUMN IF NOT EXISTS priority            TEXT DEFAULT 'media',
  ADD COLUMN IF NOT EXISTS portfolio_tier      TEXT DEFAULT 'seguimiento',
  ADD COLUMN IF NOT EXISTS last_update_at      TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS source_type         TEXT DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS updated_at          TIMESTAMPTZ DEFAULT NOW();

-- Sync derived booleans from existing data (one-time backfill)
UPDATE startups SET
  has_softlanding  = COALESCE(softlanding, false),
  has_funding      = COALESCE(fondos_obtenidos > 0, false),
  funding_total    = CASE WHEN fondos_obtenidos > 0 THEN fondos_obtenidos ELSE NULL END,
  current_status   = COALESCE(estado, 'activa'),
  normalized_name  = LOWER(TRIM(nombre))
WHERE normalized_name IS NULL;

-- ------------------------------------------------------------
-- 2. startup_programs
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS startup_programs (
  id            BIGSERIAL PRIMARY KEY,
  startup_id    BIGINT NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
  program_name  TEXT NOT NULL,
  program_year  INT,
  cohort        TEXT,
  ally          TEXT,
  entry_stage   TEXT,
  exit_stage    TEXT,
  award         TEXT,
  demo_day      DATE,
  result        TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------
-- 3. startup_updates
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS startup_updates (
  id              BIGSERIAL PRIMARY KEY,
  startup_id      BIGINT NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
  update_date     DATE NOT NULL DEFAULT CURRENT_DATE,
  source          TEXT DEFAULT 'manual',   -- manual | formulario | make
  submitted_by    TEXT,
  current_status  TEXT,
  revenue_current NUMERIC(14,2),
  funding_new     NUMERIC(14,2),
  milestone       TEXT,
  risk_level      TEXT DEFAULT 'bajo',     -- bajo | medio | alto
  support_needed  TEXT,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------
-- 4. startup_contacts
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS startup_contacts (
  id          BIGSERIAL PRIMARY KEY,
  startup_id  BIGINT NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  role        TEXT,
  email       TEXT,
  phone       TEXT,
  linkedin    TEXT,
  is_primary  BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------
-- 5. startup_tasks
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS startup_tasks (
  id          BIGSERIAL PRIMARY KEY,
  startup_id  BIGINT NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  owner_uv    TEXT,
  due_date    DATE,
  status      TEXT DEFAULT 'pendiente',   -- pendiente | en_curso | completada
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------
-- 6. form_submissions (trazabilidad Make/formularios externos)
-- TODO: conectar con Make webhook en Fase 7
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS form_submissions (
  id            BIGSERIAL PRIMARY KEY,
  startup_id    BIGINT REFERENCES startups(id) ON DELETE SET NULL,
  form_type     TEXT NOT NULL,            -- update | onboarding | contacto
  submitted_at  TIMESTAMPTZ DEFAULT NOW(),
  payload_json  JSONB,
  processed_at  TIMESTAMPTZ,
  status        TEXT DEFAULT 'pendiente' -- pendiente | procesado | error
);

-- ------------------------------------------------------------
-- 7. Indexes
-- ------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_startup_updates_startup_id  ON startup_updates(startup_id);
CREATE INDEX IF NOT EXISTS idx_startup_updates_date        ON startup_updates(update_date DESC);
CREATE INDEX IF NOT EXISTS idx_startup_programs_startup_id ON startup_programs(startup_id);
CREATE INDEX IF NOT EXISTS idx_startup_contacts_startup_id ON startup_contacts(startup_id);
CREATE INDEX IF NOT EXISTS idx_startup_tasks_startup_id    ON startup_tasks(startup_id);
CREATE INDEX IF NOT EXISTS idx_form_submissions_startup_id ON form_submissions(startup_id);
CREATE INDEX IF NOT EXISTS idx_form_submissions_status     ON form_submissions(status);

-- ------------------------------------------------------------
-- 8. auto-updated updated_at trigger
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_startups_updated_at ON startups;
CREATE TRIGGER trg_startups_updated_at
  BEFORE UPDATE ON startups
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ------------------------------------------------------------
-- 9. auto-sync last_update_at on insert to startup_updates
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION sync_startup_last_update()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE startups SET last_update_at = NOW() WHERE id = NEW.startup_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_last_update ON startup_updates;
CREATE TRIGGER trg_sync_last_update
  AFTER INSERT ON startup_updates
  FOR EACH ROW EXECUTE FUNCTION sync_startup_last_update();

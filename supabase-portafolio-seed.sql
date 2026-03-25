-- ============================================================
-- PORTAFOLIO MODULE — MINIMAL SEED DATA
-- Run AFTER supabase-portafolio.sql
-- Safe to run on empty or partial data
-- ============================================================

-- ------------------------------------------------------------
-- Seed startups (enrich existing or insert if empty)
-- ------------------------------------------------------------
INSERT INTO startups (
  nombre, normalized_name, fundadores, sector, pais, ciudad,
  current_status, priority, portfolio_tier,
  has_revenue, has_funding, has_softlanding,
  revenue_latest, revenue_currency,
  funding_total, funding_currency,
  owner_uv, anio_ingreso, last_update_at, source_type, notas
) VALUES
  ('AgroData Peru', 'agrodata peru', 'Carlos Ríos', 'Agritech', 'Perú', 'Lima',
   'activa', 'alta', 'top',
   true, true, false,
   85000, 'PEN', 120000, 'PEN',
   'Leslie Ponce', 2024, NOW() - INTERVAL '30 days', 'manual',
   'Solución de análisis de datos para pequeños agricultores.'),

  ('EduFlex', 'eduflex', 'María Condori, Rodrigo Vega', 'Edtech', 'Perú', 'Arequipa',
   'activa', 'alta', 'top',
   true, false, true,
   42000, 'PEN', NULL, NULL,
   'Arturo Garro', 2024, NOW() - INTERVAL '15 days', 'manual',
   'Plataforma adaptativa para educación rural.'),

  ('FinLink', 'finlink', 'José Mamani', 'Fintech', 'Perú', 'Lima',
   'en_seguimiento', 'media', 'seguimiento',
   false, false, false,
   NULL, NULL, NULL, NULL,
   'Marcoantonio Pacheco', 2023, NOW() - INTERVAL '100 days', 'manual',
   'Inclusión financiera para trabajadores informales.'),

  ('MediTrack', 'meditrack', 'Ana Torres', 'Healthtech', 'Perú', 'Lima',
   'activa', 'media', 'seguimiento',
   false, true, false,
   NULL, NULL, 50000, 'USD',
   'Leslie Ponce', 2025, NOW() - INTERVAL '45 days', 'manual',
   'Seguimiento de medicación para adultos mayores.'),

  ('LogiRed', 'logired', 'Pablo Chávez, Luis Flores', 'Logtech', 'Perú', 'Callao',
   'pausada', 'baja', 'watchlist',
   false, false, false,
   NULL, NULL, NULL, NULL,
   'Arturo Garro', 2023, NOW() - INTERVAL '200 days', 'manual',
   'Red de última milla para comercio electrónico regional.')
ON CONFLICT DO NOTHING;

-- ------------------------------------------------------------
-- Seed startup_programs (link to existing startup names)
-- ------------------------------------------------------------
WITH s AS (SELECT id, normalized_name FROM startups)
INSERT INTO startup_programs (startup_id, program_name, program_year, cohort, entry_stage, exit_stage, result)
SELECT s.id, 'USIL Challenge: Climatech Futures', 2024, 'C1-2024', 'idea', 'mvp', 'finalista'
FROM s WHERE s.normalized_name = 'agrodata peru'
ON CONFLICT DO NOTHING;

WITH s AS (SELECT id, normalized_name FROM startups)
INSERT INTO startup_programs (startup_id, program_name, program_year, cohort, entry_stage, exit_stage, result)
SELECT s.id, 'Accelerate Climatech 2G', 2024, 'C2-2024', 'mvp', 'traccion', 'graduada'
FROM s WHERE s.normalized_name = 'eduflex'
ON CONFLICT DO NOTHING;

-- ------------------------------------------------------------
-- Seed startup_updates
-- ------------------------------------------------------------
WITH s AS (SELECT id, normalized_name FROM startups)
INSERT INTO startup_updates (startup_id, update_date, source, submitted_by, current_status, revenue_current, milestone, risk_level, notes)
SELECT s.id, CURRENT_DATE - 30, 'manual', 'Leslie Ponce', 'activa', 85000,
  'Cierre de primer contrato con cooperativa Junín', 'bajo',
  'Muy buen momentum. Necesitan apoyo en pitch para ángeles.'
FROM s WHERE s.normalized_name = 'agrodata peru'
ON CONFLICT DO NOTHING;

WITH s AS (SELECT id, normalized_name FROM startups)
INSERT INTO startup_updates (startup_id, update_date, source, submitted_by, current_status, revenue_current, milestone, risk_level, notes)
SELECT s.id, CURRENT_DATE - 15, 'manual', 'Arturo Garro', 'activa', 42000,
  'Lanzamiento versión 2.0 con módulo de gamificación', 'bajo',
  'Tracción sólida. Explorando alianza con Fundación BBVA.'
FROM s WHERE s.normalized_name = 'eduflex'
ON CONFLICT DO NOTHING;

WITH s AS (SELECT id, normalized_name FROM startups)
INSERT INTO startup_updates (startup_id, update_date, source, submitted_by, current_status, revenue_current, milestone, risk_level, notes)
SELECT s.id, CURRENT_DATE - 100, 'manual', 'Marcoantonio Pacheco', 'en_seguimiento', NULL,
  NULL, 'medio',
  'Sin novedades desde Q3. Pendiente recontactar a founder.'
FROM s WHERE s.normalized_name = 'finlink'
ON CONFLICT DO NOTHING;

-- ------------------------------------------------------------
-- Seed startup_contacts
-- ------------------------------------------------------------
WITH s AS (SELECT id, normalized_name FROM startups)
INSERT INTO startup_contacts (startup_id, name, role, email, linkedin, is_primary)
SELECT s.id, 'Carlos Ríos', 'CEO', 'carlos@agrodata.pe', 'linkedin.com/in/carlosrios', true
FROM s WHERE s.normalized_name = 'agrodata peru'
ON CONFLICT DO NOTHING;

WITH s AS (SELECT id, normalized_name FROM startups)
INSERT INTO startup_contacts (startup_id, name, role, email, linkedin, is_primary)
SELECT s.id, 'María Condori', 'CEO', 'maria@eduflex.pe', 'linkedin.com/in/mariacondori', true
FROM s WHERE s.normalized_name = 'eduflex'
ON CONFLICT DO NOTHING;

-- ------------------------------------------------------------
-- Seed startup_tasks
-- ------------------------------------------------------------
WITH s AS (SELECT id, normalized_name FROM startups)
INSERT INTO startup_tasks (startup_id, title, owner_uv, due_date, status)
SELECT s.id, 'Conectar con red de ángeles ProInnóvate', 'Leslie Ponce',
  CURRENT_DATE + 14, 'pendiente'
FROM s WHERE s.normalized_name = 'agrodata peru'
ON CONFLICT DO NOTHING;

WITH s AS (SELECT id, normalized_name FROM startups)
INSERT INTO startup_tasks (startup_id, title, owner_uv, due_date, status)
SELECT s.id, 'Recontactar a founder - sin respuesta 3 semanas', 'Marcoantonio Pacheco',
  CURRENT_DATE + 7, 'pendiente'
FROM s WHERE s.normalized_name = 'finlink'
ON CONFLICT DO NOTHING;

-- =============================================
-- USIL VENTURES OS v2 — Actualizaciones
-- Pega esto en el SQL Editor de Supabase
-- (además del setup anterior, o desde cero)
-- =============================================

-- 1. Agregar campo binder_link a actividades
alter table actividades add column if not exists binder_link text;
alter table actividades add column if not exists binder_estado text default 'sin_binder';

-- 2. Crear tabla startups
create table if not exists startups (
  id bigserial primary key,
  nombre text not null,
  fundadores text,
  sector text,
  estado text default 'activa',        -- activa | inactiva
  origen text default 'USIL',           -- USIL | externa
  programa text,
  pais text default 'Perú',
  softlanding boolean default false,
  fondos_obtenidos numeric default 0,
  fuente_fondo text,
  anio_ingreso int,
  link_web text,
  notas text,
  created_at timestamptz default now()
);

-- 3. Políticas de acceso para startups
alter table startups enable row level security;
create policy "Acceso total startups" on startups for all using (true) with check (true);

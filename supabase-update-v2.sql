-- Agregar al SQL Editor de Supabase (nueva tabla)

create table startups (
  id bigserial primary key,
  nombre text not null,
  fundadores text,
  sector text,
  estado text default 'activa',      -- activa, inactiva
  origen text default 'USIL',        -- USIL, externa
  programa text,
  pais text default 'Perú',
  softlanding boolean default false,
  fondos_obtenidos numeric default 0,
  fuente_fondo text,
  anio_ingreso int,
  link text,
  created_at timestamptz default now()
);

alter table startups enable row level security;
create policy "Acceso total startups" on startups for all using (true) with check (true);

-- Agregar campo link_binder a actividades (si ya existe la tabla)
alter table actividades add column if not exists link_binder text;
alter table actividades add column if not exists estado_binder text default 'sin_binder';
-- valores: sin_binder, en_proceso, completado

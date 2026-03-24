-- =============================================
-- USIL VENTURES OS — SQL COMPLETO (único archivo)
-- Pega TODO esto en el SQL Editor de Supabase y ejecuta
-- =============================================

-- 1. CREAR TABLAS BASE

create table if not exists programas (
  id bigserial primary key,
  nombre text not null,
  responsable text,
  trimestre text,
  estado text default 'por_iniciar',
  prioridad text default 'media',
  fecha_inicio date,
  fecha_fin date,
  created_at timestamptz default now()
);

create table if not exists hitos (
  id bigserial primary key,
  nombre text not null,
  programa text,
  fecha date,
  responsable text,
  estado text default 'por_iniciar',
  etapa text,
  created_at timestamptz default now()
);

create table if not exists kpis (
  id bigserial primary key,
  nombre text not null,
  meta numeric default 0,
  actual numeric default 0,
  responsable text,
  estado text default 'por_iniciar',
  created_at timestamptz default now()
);

create table if not exists actividades (
  id bigserial primary key,
  nombre text not null,
  tipo text,
  fecha date,
  programa text,
  lugar text,
  modalidad text,
  binder_link text,
  binder_estado text default 'sin_binder',
  link_binder text,
  estado_binder text default 'sin_binder',
  created_at timestamptz default now()
);

create table if not exists startups (
  id bigserial primary key,
  nombre text not null,
  fundadores text,
  sector text,
  estado text default 'activa',
  origen text default 'USIL',
  programa text,
  pais text default 'Perú',
  softlanding boolean default false,
  fondos_obtenidos numeric default 0,
  fuente_fondo text,
  anio_ingreso int,
  link_web text,
  link text,
  notas text,
  created_at timestamptz default now()
);

-- 2. HABILITAR ACCESO PÚBLICO (Row Level Security)

alter table programas enable row level security;
alter table hitos enable row level security;
alter table kpis enable row level security;
alter table actividades enable row level security;
alter table startups enable row level security;

drop policy if exists "Acceso total programas" on programas;
drop policy if exists "Acceso total hitos" on hitos;
drop policy if exists "Acceso total kpis" on kpis;
drop policy if exists "Acceso total actividades" on actividades;
drop policy if exists "Acceso total startups" on startups;

create policy "Acceso total programas" on programas for all using (true) with check (true);
create policy "Acceso total hitos" on hitos for all using (true) with check (true);
create policy "Acceso total kpis" on kpis for all using (true) with check (true);
create policy "Acceso total actividades" on actividades for all using (true) with check (true);
create policy "Acceso total startups" on startups for all using (true) with check (true);

-- 3. DATOS INICIALES — PROGRAMAS (solo si la tabla está vacía)

insert into programas (nombre, responsable, trimestre, estado, prioridad, fecha_inicio, fecha_fin)
select * from (values
  ('USIL Challenge: Climatech Futures', 'Leslie Ponce', 'Q2', 'en_ejecucion', 'alta', '2026-03-01'::date, '2026-11-30'::date),
  ('Comité de Innovación Abierta', 'Todo el equipo', 'Q2', 'por_iniciar', 'alta', '2026-04-01'::date, '2026-09-30'::date),
  ('Accelerate Climatech 2G', 'Leslie Ponce', 'Q1', 'cerrado', 'alta', '2026-01-01'::date, '2026-03-31'::date),
  ('Emprende +50', 'Arturo Garro', 'Q2', 'por_iniciar', 'media', '2026-05-01'::date, '2026-11-30'::date),
  ('TechSuyo', 'Arturo Garro', 'Q2', 'por_iniciar', 'media', '2026-04-01'::date, '2026-11-30'::date),
  ('Fondos y Ecosistema', 'Marcoantonio Pacheco', 'Q2', 'retrasado', 'media', '2026-04-01'::date, '2026-12-31'::date)
) as v(nombre, responsable, trimestre, estado, prioridad, fecha_inicio, fecha_fin)
where not exists (select 1 from programas limit 1);

-- 4. DATOS INICIALES — HITOS

insert into hitos (nombre, programa, fecha, responsable, estado, etapa)
select * from (values
  ('Apertura convocatoria Climatech', 'USIL Challenge: Climatech Futures', '2026-04-06'::date, 'Leslie Ponce', 'por_iniciar', 'Convocatoria'),
  ('Comité de Innovación Abierta #1', 'Comité de Innovación Abierta', '2026-04-21'::date, 'Todo el equipo', 'por_iniciar', 'Evento'),
  ('Cierre convocatoria Climatech', 'USIL Challenge: Climatech Futures', '2026-05-10'::date, 'Leslie Ponce', 'por_iniciar', 'Convocatoria'),
  ('Selección de finalistas Climatech', 'USIL Challenge: Climatech Futures', '2026-05-25'::date, 'Leslie Ponce', 'por_iniciar', 'Evaluación'),
  ('Demo Day Climatech Futures', 'USIL Challenge: Climatech Futures', '2026-06-20'::date, 'Leslie Ponce', 'por_iniciar', 'Demo Day'),
  ('Lanzamiento Emprende +50', 'Emprende +50', '2026-05-01'::date, 'Arturo Garro', 'por_iniciar', 'Lanzamiento'),
  ('Comité de Innovación Abierta #2', 'Comité de Innovación Abierta', '2026-09-15'::date, 'Todo el equipo', 'por_iniciar', 'Evento'),
  ('Kick-off TechSuyo', 'TechSuyo', '2026-04-15'::date, 'Arturo Garro', 'por_iniciar', 'Inicio')
) as v(nombre, programa, fecha, responsable, estado, etapa)
where not exists (select 1 from hitos limit 1);

-- 5. DATOS INICIALES — KPIs

insert into kpis (nombre, meta, actual, responsable, estado)
select * from (values
  ('Pre-incubadoras con ruta operativa activa', 8::numeric, 0::numeric, 'USIL Ventures + VRA + Directivas', 'retrasado'),
  ('Mentores graduados', 40::numeric, 20::numeric, 'USIL Ventures + Proyectos Especiales + Alumni', 'en_ejecucion'),
  ('Eventos del ecosistema', 40::numeric, 0::numeric, 'USIL Ventures + Relaciones internacionales', 'retrasado'),
  ('Propuesta Fondo de Inversión Ángel', 1::numeric, 0::numeric, 'USIL Ventures + VP Proyectos Especiales + Alumni', 'por_iniciar'),
  ('Startups nuevas en portafolio', 4::numeric, 0::numeric, 'USIL Ventures + SUP', 'por_iniciar'),
  ('Participantes Emprende +50 regiones', 300::numeric, 0::numeric, 'USIL Ventures + Fundación 02:59', 'por_iniciar'),
  ('Programas de innovación abierta con empresas', 2::numeric, 0::numeric, 'Marcoantonio Pacheco', 'por_iniciar')
) as v(nombre, meta, actual, responsable, estado)
where not exists (select 1 from kpis limit 1);

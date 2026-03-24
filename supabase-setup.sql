-- =============================================
-- USIL VENTURES OS 2026 — Setup completo
-- Pega esto en el SQL Editor de Supabase
-- =============================================

-- 1. CREAR TABLAS
create table programas (
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

create table hitos (
  id bigserial primary key,
  nombre text not null,
  programa text,
  fecha date,
  responsable text,
  estado text default 'por_iniciar',
  etapa text,
  created_at timestamptz default now()
);

create table kpis (
  id bigserial primary key,
  nombre text not null,
  meta numeric default 0,
  actual numeric default 0,
  responsable text,
  estado text default 'por_iniciar',
  created_at timestamptz default now()
);

create table actividades (
  id bigserial primary key,
  nombre text not null,
  tipo text,
  fecha date,
  programa text,
  lugar text,
  modalidad text,
  created_at timestamptz default now()
);

-- 2. HABILITAR ACCESO PÚBLICO (sin login)
alter table programas enable row level security;
alter table hitos enable row level security;
alter table kpis enable row level security;
alter table actividades enable row level security;

create policy "Acceso total programas" on programas for all using (true) with check (true);
create policy "Acceso total hitos" on hitos for all using (true) with check (true);
create policy "Acceso total kpis" on kpis for all using (true) with check (true);
create policy "Acceso total actividades" on actividades for all using (true) with check (true);

-- 3. DATOS INICIALES — PROGRAMAS
insert into programas (nombre, responsable, trimestre, estado, prioridad, fecha_inicio, fecha_fin) values
('USIL Challenge: Climatech Futures', 'Leslie Ponce', 'Q2', 'en_ejecucion', 'alta', '2026-03-01', '2026-11-30'),
('Comité de Innovación Abierta', 'Todo el equipo', 'Q2', 'por_iniciar', 'alta', '2026-04-01', '2026-09-30'),
('Accelerate Climatech 2G', 'Leslie Ponce', 'Q1', 'cerrado', 'alta', '2026-01-01', '2026-03-31'),
('Emprende +50', 'Arturo Garro', 'Q2', 'por_iniciar', 'media', '2026-05-01', '2026-11-30'),
('TechSuyo', 'Arturo Garro', 'Q2', 'por_iniciar', 'media', '2026-04-01', '2026-11-30'),
('Fondos y Ecosistema', 'Marcoantonio Pacheco', 'Q2', 'retrasado', 'media', '2026-04-01', '2026-12-31');

-- 4. DATOS INICIALES — HITOS
insert into hitos (nombre, programa, fecha, responsable, estado, etapa) values
('Apertura convocatoria Climatech', 'USIL Challenge: Climatech Futures', '2026-04-06', 'Leslie Ponce', 'por_iniciar', 'Convocatoria'),
('Comité de Innovación Abierta #1', 'Comité de Innovación Abierta', '2026-04-21', 'Todo el equipo', 'por_iniciar', 'Evento'),
('Cierre convocatoria Climatech', 'USIL Challenge: Climatech Futures', '2026-05-10', 'Leslie Ponce', 'por_iniciar', 'Convocatoria'),
('Selección de finalistas Climatech', 'USIL Challenge: Climatech Futures', '2026-05-25', 'Leslie Ponce', 'por_iniciar', 'Evaluación'),
('Demo Day Climatech Futures', 'USIL Challenge: Climatech Futures', '2026-06-20', 'Leslie Ponce', 'por_iniciar', 'Demo Day'),
('Lanzamiento Emprende +50', 'Emprende +50', '2026-05-01', 'Arturo Garro', 'por_iniciar', 'Lanzamiento'),
('Comité de Innovación Abierta #2', 'Comité de Innovación Abierta', '2026-09-15', 'Todo el equipo', 'por_iniciar', 'Evento'),
('Kick-off TechSuyo', 'TechSuyo', '2026-04-15', 'Arturo Garro', 'por_iniciar', 'Inicio');

-- 5. DATOS INICIALES — KPIs
insert into kpis (nombre, meta, actual, responsable, estado) values
('Pre-incubadoras con ruta operativa activa', 8, 0, 'USIL Ventures + VRA + Directivas', 'retrasado'),
('Mentores graduados', 40, 20, 'USIL Ventures + Proyectos Especiales + Alumni', 'en_ejecucion'),
('Eventos del ecosistema', 40, 0, 'USIL Ventures + Relaciones internacionales', 'retrasado'),
('Propuesta Fondo de Inversión Ángel', 1, 0, 'USIL Ventures + VP Proyectos Especiales + Alumni', 'por_iniciar'),
('Startups nuevas en portafolio', 4, 0, 'USIL Ventures + SUP', 'por_iniciar'),
('Participantes Emprende +50 regiones', 300, 0, 'USIL Ventures + Fundación 02:59', 'por_iniciar'),
('Programas de innovación abierta con empresas', 2, 0, 'Marcoantonio Pacheco', 'por_iniciar');

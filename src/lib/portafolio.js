/**
 * Portafolio Module — Data Access Layer
 * All Supabase queries for the portfolio module centralized here.
 * Views import from this file, never call supabase directly.
 */
import { supabase } from './supabase'

// ─── Constants ────────────────────────────────────────────────────────────────

export const STATUS_OPTIONS = [
  { value: 'activa',         label: 'Activa' },
  { value: 'en_seguimiento', label: 'En seguimiento' },
  { value: 'pausada',        label: 'Pausada' },
  { value: 'cerrada',        label: 'Cerrada' },
  { value: 'adquirida',      label: 'Adquirida' },
  { value: 'sin_dato',       label: 'Sin dato' },
]

export const PRIORITY_OPTIONS = [
  { value: 'alta',  label: 'Alta' },
  { value: 'media', label: 'Media' },
  { value: 'baja',  label: 'Baja' },
]

export const TIER_OPTIONS = [
  { value: 'top',        label: 'Top' },
  { value: 'seguimiento', label: 'Seguimiento' },
  { value: 'watchlist',  label: 'Watchlist' },
  { value: 'alumni',     label: 'Alumni' },
]

export const RISK_OPTIONS = [
  { value: 'bajo',  label: 'Bajo' },
  { value: 'medio', label: 'Medio' },
  { value: 'alto',  label: 'Alto' },
]

export const SECTOR_OPTIONS = [
  'Agritech','Cleantech','Edtech','Fintech',
  'Healthtech','Logtech','Retailtech','Socialtech','Otro',
]

export const TASK_STATUS_OPTIONS = [
  { value: 'pendiente',  label: 'Pendiente' },
  { value: 'en_curso',   label: 'En curso' },
  { value: 'completada', label: 'Completada' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Returns recency semaphore based on last_update_at.
 * @param {string|null} lastUpdateAt — ISO timestamp
 * @returns {{ color: string, label: string, days: number|null }}
 */
export function getRecency(lastUpdateAt) {
  if (!lastUpdateAt) return { color: '#9CA3AF', label: 'Sin update', days: null }
  const days = Math.floor((Date.now() - new Date(lastUpdateAt)) / 86400000)
  if (days < 90)  return { color: '#059669', label: `${days}d`,  days }
  if (days < 180) return { color: '#D97706', label: `${days}d`,  days }
  return              { color: '#EF4444', label: `${days}d`,  days }
}

/** Format currency — shows S/ or $ depending on currency field */
export function formatCurrency(amount, currency = 'PEN') {
  if (!amount) return '—'
  const sym = currency === 'USD' ? '$' : 'S/'
  return `${sym} ${Number(amount).toLocaleString('es-PE')}`
}

// ─── Startups ─────────────────────────────────────────────────────────────────

/** Fetch all startups with computed recency. Filters are optional. */
export async function fetchStartups({ status, sector, tier, priority, hasFunding, hasRevenue } = {}) {
  let q = supabase.from('startups').select('*').order('id', { ascending: false })

  if (status)                   q = q.eq('current_status', status)
  if (sector)                   q = q.eq('sector', sector)
  if (tier)                     q = q.eq('portfolio_tier', tier)
  if (priority)                 q = q.eq('priority', priority)
  if (hasFunding === true)      q = q.eq('has_funding', true)
  if (hasFunding === false)     q = q.eq('has_funding', false)
  if (hasRevenue === true)      q = q.eq('has_revenue', true)
  if (hasRevenue === false)     q = q.eq('has_revenue', false)

  const { data, error } = await q
  if (error) throw error
  return (data || []).map(s => ({ ...s, _recency: getRecency(s.last_update_at) }))
}

/** Fetch single startup by id */
export async function fetchStartupById(id) {
  const { data, error } = await supabase
    .from('startups').select('*').eq('id', id).single()
  if (error) throw error
  return { ...data, _recency: getRecency(data.last_update_at) }
}

/** Insert or update startup */
export async function saveStartup(form, id = null) {
  const payload = {
    ...form,
    normalized_name: form.nombre?.toLowerCase().trim(),
    has_funding:     !!form.funding_total && form.funding_total > 0,
    has_revenue:     !!form.revenue_latest && form.revenue_latest > 0,
    has_softlanding: !!form.has_softlanding,
    updated_at:      new Date().toISOString(),
  }
  if (id) {
    const { error } = await supabase.from('startups').update(payload).eq('id', id)
    if (error) throw error
  } else {
    const { error } = await supabase.from('startups').insert([payload])
    if (error) throw error
  }
}

/** Delete startup (cascades to all related tables) */
export async function deleteStartup(id) {
  const { error } = await supabase.from('startups').delete().eq('id', id)
  if (error) throw error
}

/** Compute KPI summary from array of startups */
export function computeOverviewKPIs(startups) {
  const total       = startups.length
  const activas     = startups.filter(s => s.current_status === 'activa').length
  const seguimiento = startups.filter(s => s.current_status === 'en_seguimiento').length
  const conRevenue  = startups.filter(s => s.has_revenue).length
  const conFunding  = startups.filter(s => s.has_funding).length
  const conSoft     = startups.filter(s => s.has_softlanding).length
  const sinUpdate90 = startups.filter(s => s._recency?.days === null || s._recency?.days > 90).length
  const topTier     = startups.filter(s => s.portfolio_tier === 'top').length

  return { total, activas, seguimiento, conRevenue, conFunding, conSoft, sinUpdate90, topTier }
}

// ─── Startup Programs ─────────────────────────────────────────────────────────

export async function fetchPrograms(startupId) {
  const { data, error } = await supabase
    .from('startup_programs').select('*')
    .eq('startup_id', startupId).order('program_year', { ascending: false })
  if (error) throw error
  return data || []
}

export async function saveProgram(form, id = null) {
  if (id) {
    const { error } = await supabase.from('startup_programs').update(form).eq('id', id)
    if (error) throw error
  } else {
    const { error } = await supabase.from('startup_programs').insert([form])
    if (error) throw error
  }
}

export async function deleteProgram(id) {
  const { error } = await supabase.from('startup_programs').delete().eq('id', id)
  if (error) throw error
}

// ─── Startup Updates ──────────────────────────────────────────────────────────

/** Fetch updates for one startup or all (for Updates view) */
export async function fetchUpdates({ startupId, riskLevel, dateFrom, dateTo, limit = 50 } = {}) {
  let q = supabase
    .from('startup_updates')
    .select('*, startups(nombre, sector, current_status)')
    .order('update_date', { ascending: false })
    .limit(limit)

  if (startupId) q = q.eq('startup_id', startupId)
  if (riskLevel) q = q.eq('risk_level', riskLevel)
  if (dateFrom)  q = q.gte('update_date', dateFrom)
  if (dateTo)    q = q.lte('update_date', dateTo)

  const { data, error } = await q
  if (error) throw error
  return data || []
}

/** Insert a new update — also triggers last_update_at sync via DB trigger */
export async function saveUpdate(form) {
  const payload = {
    startup_id:     form.startup_id,
    update_date:    form.update_date || new Date().toISOString().split('T')[0],
    source:         form.source || 'manual',
    submitted_by:   form.submitted_by,
    current_status: form.current_status,
    revenue_current: form.revenue_current ? parseFloat(form.revenue_current) : null,
    funding_new:    form.funding_new ? parseFloat(form.funding_new) : null,
    milestone:      form.milestone,
    risk_level:     form.risk_level || 'bajo',
    support_needed: form.support_needed,
    notes:          form.notes,
  }
  const { data, error } = await supabase.from('startup_updates').insert([payload]).select().single()
  if (error) throw error
  return data
}

export async function deleteUpdate(id) {
  const { error } = await supabase.from('startup_updates').delete().eq('id', id)
  if (error) throw error
}

// ─── Startup Contacts ─────────────────────────────────────────────────────────

export async function fetchContacts(startupId) {
  const { data, error } = await supabase
    .from('startup_contacts').select('*')
    .eq('startup_id', startupId).order('is_primary', { ascending: false })
  if (error) throw error
  return data || []
}

export async function saveContact(form, id = null) {
  if (id) {
    const { error } = await supabase.from('startup_contacts').update(form).eq('id', id)
    if (error) throw error
  } else {
    const { error } = await supabase.from('startup_contacts').insert([form])
    if (error) throw error
  }
}

export async function deleteContact(id) {
  const { error } = await supabase.from('startup_contacts').delete().eq('id', id)
  if (error) throw error
}

// ─── Startup Tasks ────────────────────────────────────────────────────────────

export async function fetchTasks(startupId) {
  const { data, error } = await supabase
    .from('startup_tasks').select('*')
    .eq('startup_id', startupId).order('due_date', { ascending: true })
  if (error) throw error
  return data || []
}

export async function saveTask(form, id = null) {
  if (id) {
    const { error } = await supabase.from('startup_tasks').update(form).eq('id', id)
    if (error) throw error
  } else {
    const { error } = await supabase.from('startup_tasks').insert([form])
    if (error) throw error
  }
}

export async function deleteTask(id) {
  const { error } = await supabase.from('startup_tasks').delete().eq('id', id)
  if (error) throw error
}

// ─── Form Submissions (Make integration point) ────────────────────────────────
// TODO Fase 7: conectar Make webhook → POST /form_submissions
// El payload_json debe contener los mismos campos que startup_updates
// Supabase Edge Function procesa el JSON y llama saveUpdate() + marca processed_at

export async function logFormSubmission(startupId, formType, payloadJson) {
  const { error } = await supabase.from('form_submissions').insert([{
    startup_id:   startupId,
    form_type:    formType,
    payload_json: payloadJson,
    status:       'pendiente',
  }])
  if (error) throw error
}

export async function fetchPendingSubmissions() {
  const { data, error } = await supabase
    .from('form_submissions')
    .select('*').eq('status', 'pendiente')
    .order('submitted_at', { ascending: true })
  if (error) throw error
  return data || []
}

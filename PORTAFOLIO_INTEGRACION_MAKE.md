# Portafolio — Integración con Make (Guía rápida)

## Qué existe hoy

| Pieza | Estado |
|---|---|
| Tabla `startup_updates` | ✅ Lista |
| Tabla `form_submissions` (trazabilidad) | ✅ Lista |
| Edge Function `registrar-update` | ✅ Código listo — pendiente deploy |
| Vista Updates en la app | ✅ Activa |
| Make scenario | ⏳ TODO Fase 7 |

---

## Paso 1 — Deployar la Edge Function

```bash
# Instalar Supabase CLI si no lo tienes
npm install -g supabase

# Login
supabase login

# Desde la raíz del proyecto
supabase functions deploy registrar-update --project-ref vtftpanqceyliagdhdua
```

---

## Paso 2 — Configurar el secret en Supabase

Supabase Dashboard → **Edge Functions** → `registrar-update` → **Secrets**

| Variable | Valor |
|---|---|
| `UV_FORM_SECRET` | Cualquier string secreto. Ej: `uv-2026-secret-xyz` |

> Este mismo valor se pone en Make como header `x-api-secret`.

---

## Paso 3 — URL del endpoint

```
POST https://vtftpanqceyliagdhdua.supabase.co/functions/v1/registrar-update
```

---

## Payload esperado (JSON)

```json
{
  "startup_name":    "AgroData Peru",
  "update_date":     "2026-03-25",
  "submitted_by":    "María Torres",
  "current_status":  "activa",
  "revenue_current": 95000,
  "funding_new":     0,
  "milestone":       "Firmamos contrato con cooperativa La Unión",
  "risk_level":      "bajo",
  "support_needed":  "Intro a red de ángeles",
  "notes":           "El equipo está creciendo. Buscan contratar un CTO.",
  "form_type":       "update",
  "source":          "formulario"
}
```

**Campos opcionales:** `startup_id` (si se conoce el ID, evita búsqueda por nombre), `funding_new`, `milestone`, `support_needed`, `notes`.

**`current_status` valores válidos:**
`activa` | `en_seguimiento` | `pausada` | `cerrada` | `adquirida` | `sin_dato`

**`risk_level` valores válidos:** `bajo` | `medio` | `alto`

---

## Headers requeridos

```
Authorization: Bearer <SUPABASE_ANON_KEY>
x-api-secret: <UV_FORM_SECRET>
Content-Type: application/json
```

---

## Respuesta exitosa

```json
{
  "ok": true,
  "update_id": 42,
  "startup_id": 7,
  "submission_id": 15
}
```

---

## Flujo en Make

```
Trigger (Typeform / Google Forms / Webhook)
  ↓
HTTP Module → POST registrar-update
  ↓
[Opcional] Slack/Email → notificar al owner UV
  ↓
[Opcional] Google Sheets → log de submissions
```

### Configuración en Make (HTTP Module)

| Campo | Valor |
|---|---|
| URL | `https://vtftpanqceyliagdhdua.supabase.co/functions/v1/registrar-update` |
| Method | `POST` |
| Headers | `Authorization: Bearer <anon_key>` + `x-api-secret: <UV_FORM_SECRET>` |
| Body type | `application/json` |
| Body | Mapear campos del formulario al payload JSON |

---

## Trazabilidad

Cada llamada exitosa crea un registro en `form_submissions`:

```sql
SELECT * FROM form_submissions ORDER BY submitted_at DESC LIMIT 20;
```

La app muestra un aviso amarillo en la vista **Updates** cuando hay submissions con `status = 'pendiente'`.

---

## Probar sin Make (curl)

```bash
curl -X POST \
  https://vtftpanqceyliagdhdua.supabase.co/functions/v1/registrar-update \
  -H "Authorization: Bearer <SUPABASE_ANON_KEY>" \
  -H "x-api-secret: <UV_FORM_SECRET>" \
  -H "Content-Type: application/json" \
  -d '{
    "startup_name": "AgroData Peru",
    "submitted_by": "Test UV",
    "current_status": "activa",
    "milestone": "Test de integración",
    "risk_level": "bajo",
    "notes": "Prueba desde curl"
  }'
```

---

## TODOs pendientes para Fase 7

- [ ] Deploy Edge Function con `supabase functions deploy`
- [ ] Configurar `UV_FORM_SECRET` en Supabase Secrets
- [ ] Crear scenario en Make con trigger desde Typeform o Google Forms
- [ ] Agregar notificación Slack al owner UV tras cada update de riesgo alto
- [ ] Activar procesado automático de `form_submissions` pendientes (cron o trigger Supabase)

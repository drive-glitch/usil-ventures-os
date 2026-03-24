# GUÍA COMPLETA — USIL Ventures OS
## Cursor + Supabase + Vercel · Todo gratis

---

## PASO 1 — Instalar Cursor (5 minutos)
1. Ve a https://cursor.com y descarga Cursor para Windows
2. Instálalo como cualquier programa
3. Ábrelo y crea cuenta gratis con Google
4. Abre la carpeta del proyecto: Archivo → Abrir carpeta → selecciona la carpeta "usil-final"

---

## PASO 2 — Crear base de datos en Supabase (5 minutos)
1. Ve a https://supabase.com → "Start your project" → crea cuenta con Google
2. Clic en "New project"
   - Nombre: usil-ventures-os
   - Password: crea una contraseña (guárdala)
   - Región: South America (São Paulo)
3. Espera ~2 minutos mientras crea el proyecto
4. Ve a "SQL Editor" en el menú izquierdo
5. Clic en "New query"
6. Abre el archivo **supabase-setup.sql** de esta carpeta, copia TODO el contenido y pégalo en el editor
7. Clic en "Run" (botón verde)
8. Verás "Success" — tus tablas y datos están creados

---

## PASO 3 — Conectar Supabase con la app (2 minutos)
1. En Supabase, ve a "Project Settings" (ícono de engranaje) → "API"
2. Copia el valor de **Project URL** (algo como https://xxxxx.supabase.co)
3. Copia el valor de **anon public** (clave larga)
4. En la carpeta del proyecto, abre el archivo **.env.local**
5. Reemplaza los valores:
   ```
   VITE_SUPABASE_URL=https://xxxxx.supabase.co   ← pega tu Project URL
   VITE_SUPABASE_ANON_KEY=eyJxxx...               ← pega tu anon key
   ```
6. Guarda el archivo

---

## PASO 4 — Probar en tu PC (2 minutos)
1. En Cursor, abre la Terminal: menú Terminal → New Terminal
2. Escribe: npm install
   Espera que termine (instala las dependencias)
3. Escribe: npm run dev
4. Abre tu navegador en: http://localhost:5173
5. Deberías ver la app funcionando con todos los datos

---

## PASO 5 — Publicar en GitHub (3 minutos)
1. Ve a https://github.com → crea cuenta gratis
2. Clic en "New repository"
   - Nombre: usil-ventures-os
   - Público
   - Clic en "Create repository"
3. En Cursor, abre la Terminal y escribe estos comandos uno por uno:
   ```
   git init
   git add .
   git commit -m "USIL Ventures OS inicial"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/usil-ventures-os.git
   git push -u origin main
   ```
   (Reemplaza TU_USUARIO con tu usuario de GitHub)

---

## PASO 6 — Publicar en Vercel (3 minutos)
1. Ve a https://vercel.com → crea cuenta con GitHub
2. Clic en "Add New Project"
3. Importa el repositorio "usil-ventures-os"
4. IMPORTANTE — antes de hacer Deploy, clic en "Environment Variables" y agrega:
   - VITE_SUPABASE_URL → tu Project URL de Supabase
   - VITE_SUPABASE_ANON_KEY → tu anon key de Supabase
5. Clic en "Deploy"
6. En 2 minutos tienes tu URL: **usil-ventures-os.vercel.app**

---

## LISTO — Tu app está publicada para siempre

Comparte la URL con Leslie, Arturo y el equipo.
Todos ven y editan los mismos datos en tiempo real.
Sin costo mensual.

---

## Hacer cambios en el futuro (sin límite de tokens)
1. Describe el cambio que quieres a Claude
2. Claude te da el código exacto
3. Abre el archivo en Cursor, reemplaza el código
4. En Terminal: git add . → git commit -m "descripción" → git push
5. Vercel actualiza la app automáticamente en 1 minuto

---

## Si algo falla
- Cursor no abre → reinicia el programa
- npm install falla → escríbele a Claude con el error exacto
- Supabase no conecta → verifica que el .env.local tenga las credenciales correctas sin espacios
- Vercel no despliega → verifica que agregaste las variables de entorno en el paso 6

---

## Sobre Manus + Drive (integración futura)
Cuando la app esté publicada y funcionando, puedes agregar:
- Make.com (gratis) para sincronizar Google Sheets → Supabase automáticamente
- Así el equipo actualiza un Sheet y la app se actualiza sola
- Claude te da la guía exacta cuando estés listo para ese paso

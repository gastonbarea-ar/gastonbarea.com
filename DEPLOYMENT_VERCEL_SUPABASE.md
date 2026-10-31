# Guía de Despliegue en Producción: Vercel + Supabase + Sender
**Proyecto:** Gastón Barea – Arquitecto de Software, Dirección Ejecutiva PMO & Bioeconomía  
**Dominios:** `gastonbarea.com` / `gastonbarea.com.ar`

---

## 1. Configuración de Supabase (Base de Datos PostgreSQL, CRM & Portal Clientes)

1. Ingresá a [supabase.com](https://supabase.com) y seleccioná tu proyecto `gastonbarea-prod`.
2. Andá al **SQL Editor** en el panel izquierdo de Supabase.
3. Ejecutá el archivo `supabase/schema.sql` del proyecto para disponer de las tablas de prospectos, propuestas, empresas, contactos corporativos/individuales, blog y configuración.
4. En **Project Settings > API**, copiá:
   - **Project URL** (`https://xyz.supabase.co`)
   - **anon / public key** (`eyJhbGci...`)
   - **service_role key** (`eyJhbGci...`)

---

## 2. Despliegue en Vercel (Frontend Edge + Funciones Serverless `/api/*`)

1. El repositorio en **GitHub** (`gastonbarea-ar/gastonbarea.com`) se despliega directamente en [vercel.com](https://vercel.com).
2. En **Environment Variables** de Vercel, configurá las siguientes variables:

| Variable | Valor | Descripción |
|---|---|---|
| `GEMINI_API_KEY` | `AIzaSy...` | Clave de Google Gemini API para el Gemelo Digital y armador de soluciones con IA |
| `SUPABASE_URL` | `https://xyz.supabase.co` | URL de tu proyecto Supabase |
| `SUPABASE_ANON_KEY` | `eyJ...` | Clave pública/anónima de Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` | Clave administrativa para operaciones de CRM y Portal Clientes |
| `SENDER_API_KEY` | `eyJ...` | (Opcional - Cuando actives correos) Token de API de **Sender.net** para notificaciones por email |
| `NOTIFICATION_EMAIL` | `gastonbarea.com@gmail.com` | Correo donde recibís alertas de nuevos leads y diagnósticos |
| `FROM_EMAIL` | `gaston@gastonbarea.com` | Remitente verificado en Sender |

3. Las funciones Serverless en `/api/` se publican automáticamente:
   - `/api/ai-custom-solution` (Armador de páginas y servicios personalizados con IA)
   - `/api/architecture-proposal` (Diagnóstico y propuesta de arquitectura con IA)
   - `/api/architecture-qa` (Consultas interactivas de arquitectura)
   - `/api/save-contact` (Registro de contactos en Supabase + aviso por Sender)
   - `/api/save-proposal` (Registro de propuestas en Supabase + aviso por Sender)

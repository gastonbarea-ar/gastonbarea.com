# Guía de Despliegue en Producción: Vercel + Supabase
**Proyecto:** Gastón Barea – Arquitecto de Software & Consultor Tecnológico  
**Dominios:** `gastonbarea.com` / `gastonbarea.com.ar`

---

## 1. Configuración de Supabase (Base de Datos PostgreSQL & Prospectos)

1. Ingresá a [supabase.com](https://supabase.com) y creá un nuevo proyecto:
   - **Nombre:** `gastonbarea-prod`
   - **Región:** `sa-east-1 (São Paulo)` o `us-east-1` (menor latencia para Argentina/Latam).
   - Definí una contraseña segura para la base de datos PostgreSQL.

2. Andá al **SQL Editor** en el panel izquierdo de Supabase.
3. Copiá y pegá el contenido del archivo `supabase/schema.sql` del proyecto y ejecutalo (**Run**).
   - Esto creará automáticamente las tablas `proposals` y `contact_inquiries`.
   - Habilitará las políticas de seguridad **Row Level Security (RLS)** para inserción anónima segura y lectura protegida.

4. En **Project Settings > API**, copiá:
   - **Project URL** (`https://xyz.supabase.co`)
   - **anon / public key** (`eyJhbGci...`)

---

## 2. Despliegue en Vercel (Frontend Edge + Funciones Serverless de IA)

1. Subí tu código a un repositorio en **GitHub** (`gastonbarea-web`).
2. Ingresá a [vercel.com](https://vercel.com) y hacé clic en **Add New > Project**.
3. Importá tu repositorio de GitHub.
4. En **Environment Variables** (Variables de Entorno), agregá las siguientes claves:

| Variable | Valor | Descripción |
|---|---|---|
| `GEMINI_API_KEY` | `AIzaSy...` | Clave de Google Gemini API para el motor de arquitectura con IA (Privada en backend) |
| `SUPABASE_URL` | `https://xyz.supabase.co` | URL privada de tu proyecto Supabase (sin prefijo VITE_ para no exponerla al navegador) |
| `SUPABASE_ANON_KEY` | `eyJ...` | Clave de acceso a Supabase (Privada en backend) |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` | (Opcional) Clave con permisos administrativos para operaciones seguras en backend |

5. Hacé clic en **Deploy**.
   - Vercel construirá el sitio automáticamente en menos de 1 minuto con el archivo `vercel.json` ya preconfigurado.
   - Las rutas `/api/architecture-proposal` y `/api/architecture-qa` se desplegarán como Serverless Functions automáticas.

---

## 3. Conexión de Dominios Personalizados

En Vercel:
1. Andá a **Project Settings > Domains**.
2. Agregá `gastonbarea.com` y `gastonbarea.com.ar`.
3. Vercel te proporcionará los registros DNS tipo **A Record** (`76.76.21.21`) o **CNAME** (`cname.vercel-dns.com`) para configurarlos en tu registrador de dominios (NIC Argentina o Cloudflare/Namecheap).
4. El certificado SSL HTTPS se genera de forma 100% gratuita y automática.

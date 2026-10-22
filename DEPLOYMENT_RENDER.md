# Guía de Arquitectura & Despliegue en Render: Worker de Automatización con IA y Correos

Esta guía documenta la puesta en marcha del **Servicio de Automatización y Background Worker** en **Render.com** para `gastonbarea.com` / `gastonbarea.com.ar`.

---

## 1. Rol de Render en la Arquitectura

```
[ Visitante en Web ] ──> [ Vercel (Frontend Ultra Rápido) ]
                               │
                               ▼
                     [ Supabase (PostgreSQL 16) ]
                               │
                               ▼ Database Webhooks
                     [ Render.com (Worker Node.js) ]
                               │
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
 [ Google Gemini AI ]                   [ Resend API ]
 (Genera propuestas ejecutivas)          (Despacha emails al cliente y a Gastón)
```

- **Vercel:** Despliega el frontend estático y las respuestas inmediatas de la interfaz.
- **Supabase:** Almacena los leads (`proposals`) y consultas (`contact_inquiries`).
- **Render:** Ejecuta el backend persistente, escucha webhooks de base de datos, corre tareas sin timeout y despacha correos automáticos personalizados con IA.

---

## 2. Despliegue en Render en 3 Pasos

1. Ingresá a [dashboard.render.com](https://dashboard.render.com).
2. Hacé clic en **New + > Blueprint** (o **Web Service**) y seleccioná tu repositorio de GitHub: `gastonbarea.com`.
3. Render detectará automáticamente el archivo `render.yaml`. En la sección de variables de entorno, completá los valores:

| Variable | Valor Recomendado | Rol |
|---|---|---|
| `GEMINI_API_KEY` | `AIzaSy...` | Clave de Google Gemini para generación de propuestas |
| `SUPABASE_URL` | `https://xyz.supabase.co` | URL privada de tu proyecto Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` | Clave administrativa segura para el worker en Render |
| `RESEND_API_KEY` | `re_123456...` | Clave de [Resend.com](https://resend.com) para envío de correos |
| `NOTIFICATION_EMAIL` | `gastonbarea.com@gmail.com` | Tu correo donde recibirás alertas inmediatas |
| `FROM_EMAIL` | `Gastón Barea <onboarding@resend.dev>` | Remitente (o con tu dominio verificado: `contacto@gastonbarea.com.ar`) |
| `WEBHOOK_SECRET` | *(Generado automáticamente)* | Token de seguridad para validar llamadas de Supabase |

4. Hacé clic en **Apply / Deploy**.

---

## 3. Conexión de Database Webhooks en Supabase

Para que Supabase avise a Render cada vez que entra un nuevo prospecto:

1. En tu panel de **Supabase**, andá a **Database > Webhooks**.
2. Hacé clic en **Create a new webhook**:
   - **Name:** `notify-new-proposals`
   - **Table:** `public.proposals`
   - **Events:** Seleccioná únicamente `INSERT`
   - **Type of Webhook:** `HTTP Request`
   - **Method:** `POST`
   - **URL:** `https://tu-servicio-en-render.onrender.com/api/webhooks/supabase`
   - **HTTP Headers:**
     - Key: `x-webhook-secret`
     - Value: El mismo token configurado en tu variable `WEBHOOK_SECRET` de Render.
3. Hacé lo mismo para la tabla `public.contact_inquiries` con la misma URL.

---

## 4. Pruebas y Validación Local

Podés probar el endpoint de webhooks localmente o en el servidor con `curl`:

```bash
curl -X POST http://localhost:3000/api/webhooks/supabase \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: TU_TOKEN" \
  -d '{
    "type": "INSERT",
    "table": "contact_inquiries",
    "record": {
      "name": "Cliente de Prueba",
      "email": "cliente@ejemplo.com",
      "company": "Empresa Test S.A.",
      "service_area": "Business Innovación",
      "requirements": "Necesitamos automatizar nuestro pipeline de ventas con IA"
    }
  }'
```

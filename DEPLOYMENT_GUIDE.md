# Attack Metrics Suite - Guía de Despliegue y Uso

## 🎯 Descripción General

Plataforma de análisis de partidos con:
- **3 aplicaciones HTML integradas** (Attack Metrics, IA Pases Táctico, Shooting Analysis)
- **Sistema de login con Postgres/Vercel Postgres**
- **Gestión de licencias** (1 año por usuario, renovable)
- **Single-device login** (1 dispositivo activo a la vez)
- **Panel de administración** para crear usuarios y gestionar licencias
- **Sincronización de progreso** entre apps

---

## 🚀 Requisitos Previos

- Node.js 18+
- PostgreSQL local (desarrollo) o Vercel Postgres (producción)
- Cuenta en Vercel
- Git + GitHub

---

## 📋 Setup Local (Desarrollo)

### 1. Clonar repositorio
```bash
git clone <tu-repo>
cd attack-metrics-suite
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Crea `.env.local`:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/attack_metrics"
NEXTAUTH_URL="http://localhost:3000"
AUTH_SECRET="6oT62c7HEosRnaz8uCWWn83qxHjJSO6NtWky4331tepzIhpY9Wg3rQLK7/WScFU/"
AUTH_URL="http://localhost:3000"
```

### 4. Inicializar base de datos
```bash
npx prisma db push
```

### 5. Crear usuario admin
```bash
npx tsx scripts/create-admin.ts admin MiPassword123 admin@ejemplo.com
```

### 6. Iniciar servidor local
```bash
npm run dev
```

Accede a **http://localhost:3000/login**

Credenciales:
- Usuario: `admin`
- Contraseña: `MiPassword123`

---

## 🏗️ Deploy en Vercel

### 1. Conectar repositorio en Vercel

### 2. Configurar variables de entorno en Vercel

En el dashboard de Vercel, añade:

**Production**
- `DATABASE_URL`: URL de Vercel Postgres (desde Storage)
- `AUTH_SECRET`: 6oT62c7HEosRnaz8uCWWn83qxHjJSO6NtWky4331tepzIhpY9Wg3rQLK7/WScFU/ (marca como Sensitive)
- `NEXTAUTH_URL`: https://tu-proyecto.vercel.app
- `AUTH_URL`: https://tu-proyecto.vercel.app

**Preview** (opcional)
- Usa las mismas o apunta a otra DB de staging

### 3. Crear Vercel Postgres

En Vercel → Storage → Create Database → Postgres

Copia la `DATABASE_URL` y pégala en las env vars.

### 4. Migrar base de datos en producción

Una vez deployado:

```bash
# Conecta a tu DB de Vercel
DATABASE_URL="<tu-postgres-url>" npx prisma db push
```

### 5. Crear primer admin en producción

```bash
DATABASE_URL="<tu-postgres-url>" npx tsx scripts/create-admin.ts admin MySecurePassword admin@tudominio.com
```

---

## 🔑 Flujo de Compra y Uso

### Admin (Tú)

1. Accede a `/admin` con credenciales admin
2. En el panel:
   - **Crear Usuario**: introduce usuario, contraseña, email, días de licencia (default 365)
   - **Editar Licencia**: modifica días restantes para un usuario existente
3. Comparte credenciales con el cliente

### Usuario Final (Cliente)

1. Accede a `/login`
2. Ingresa usuario y contraseña
3. Entra a `/dashboard` con acceso a 3 apps:
   - **App 1**: IA Pases Táctico
   - **App 2**: Attack Metrics v3.1
   - **App 3**: Shooting Analysis
4. Alterna entre apps con botón "Volver al Dashboard"
5. Los datos se sincronizan automáticamente entre apps (localStorage + sync-data.js)

---

## 🔐 Seguridad

- **Contraseñas**: Hasheadas con bcrypt (10 rounds)
- **Sesiones**: JWT tokens seguros
- **Single-device**: Session lock con timeout de 60s (heartbeat automático)
- **Licencias**: Validadas en cada login
- **BD**: Postgres en Vercel con backup automático

---

## 📱 Estructura de Archivos Clave

```
attack-metrics-suite/
├── app/
│   ├── login/page.tsx           # Página de login
│   ├── admin/page.tsx           # Panel de administración
│   ├── dashboard/page.tsx       # Dashboard principal
│   ├── apps/
│   │   ├── app1/page.tsx        # IA Pases Táctico
│   │   ├── app2/page.tsx        # Attack Metrics
│   │   └── app3/page.tsx        # Shooting Analysis
│   └── api/
│       ├── admin/
│       │   ├── users/route.ts   # POST: crear usuarios
│       │   └── licenses/route.ts # PATCH: actualizar licencias
│       ├── auth/[...nextauth]/route.ts
│       └── session-lock/route.ts
├── components/
│   └── SessionHeartbeat.tsx     # Mantiene sesión activa
├── lib/
│   ├── auth.ts                  # Configuración NextAuth
│   └── prisma.ts                # Cliente Prisma
├── prisma/
│   └── schema.prisma            # Modelos de BD
├── public/
│   ├── IA PASES TACTICO1bCDEFG.html
│   ├── prueba111ABCDE.HTML
│   ├── SHOOTING31.html
│   └── sync-data.js             # Utilidad de sincronización
└── scripts/
    └── create-admin.ts          # Script para crear admin
```

---

## 🎮 Características

### Dashboard
- Grid de 3 apps con descripciones
- Información de licencia
- Botón para cerrar sesión

### Aplicaciones HTML Integradas
- Cargadas como iframes
- localStorage para persistencia de datos
- `sync-data.js` para sincronización entre tabs
- Botón "Volver al Dashboard" en cada app

### Panel Admin
- Tabla de usuarios con estado de conexión
- Crear usuario con días de licencia
- Editar días restantes por usuario
- Ver última actividad

### Heartbeat de Sesión
- POST a `/api/session-lock` cada 15 segundos
- Bloquea login simultáneo en 2+ dispositivos
- Timeout de 60 segundos

---

## 🧪 Testing

### Local
```bash
npm run dev
# http://localhost:3000/login
# Admin: admin / MiPassword123
```

### Build
```bash
npm run build
npm start
```

---

## 📊 Modelos de Datos (Prisma)

```prisma
model User {
  id String @id @default(cuid())
  username String @unique
  passwordHash String
  email String? @unique
  role Role (USER | ADMIN)
  licenses License[]
  sessionLocks SessionLock[]
}

model License {
  id String @id @default(cuid())
  userId String
  startDate DateTime
  endDate DateTime
  isActive Boolean
}

model SessionLock {
  id String @id @default(cuid())
  userId String @unique
  lastSeen DateTime
}
```

---

## 🆘 Troubleshooting

### "MODULE NOT FOUND" al compilar
- Ejecuta `npm install` nuevamente
- Elimina `.next` y vuelve a compilar

### Error de BD en producción
- Verifica que `DATABASE_URL` esté correcta en Vercel
- Ejecuta `npx prisma db push` con esa URL

### Login no funciona
- Asegúrate de haber creado el admin con `create-admin.ts`
- Verifica que `AUTH_SECRET` sea el mismo en `.env` y Vercel

### Licencia expirada
- En el panel admin, edita los días restantes del usuario

---

## 🚀 Próximos Pasos (Opcional)

1. **API de webhooks**: Sincronizar con tu sistema de pagos
2. **Rate limiting**: Proteger endpoints de API
3. **Logging avanzado**: Registrar cada acción de usuario
4. **Export de reportes**: PDF/Excel con análisis
5. **Multi-idioma**: I18n para ES/EN/FR

---

## 📝 Licencia

Propiedad de David Tito

---

**¿Preguntas?** Contacta a admin@tu-dominio.com

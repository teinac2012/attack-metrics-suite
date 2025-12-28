# Attack Métrics Hub

## Setup
1. Copy .env.example to .env and set DATABASE_URL, NEXTAUTH_URL, AUTH_SECRET.
2. Generate client: npm run prisma
3. Start dev: npm run dev

## Deploy (Vercel)
- Add env vars in Vercel project.
- Provision Vercel Postgres and set DATABASE_URL.

## Admin
- Visit /admin (requires ADMIN user).

## Single-device
- Login creates a session lock; concurrent logins are blocked within 60s heartbeat.

## 🚀 Guía de Inicio Rápido

### 1. Configurar Base de Datos

Edita el archivo `.env` con tu conexión PostgreSQL:

```env
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/attack_metrics"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="genera-un-secreto-con-openssl-rand-base64-32"
```

### 2. Crear las Tablas

```bash
npx prisma db push
```

### 3. Crear Usuario Administrador

```bash
npx tsx scripts/create-admin.ts [usuario] [contraseña] [email]
```

Ejemplo:
```bash
npx tsx scripts/create-admin.ts admin MiPassword123 admin@midominio.com
```

Si no pasas parámetros, usará:
- Usuario: `admin`
- Contraseña: `admin123`
- Email: `admin@example.com`

### 4. Instalar tsx (si no lo tienes)

```bash
npm install -g tsx
```

### 5. Iniciar el Servidor

```bash
npm run dev
```

Abre http://localhost:3000/login

### 6. Tus 3 Aplicaciones

Las aplicaciones están integradas en:
- **App 1 - IA Pases Táctico**: http://localhost:3000/apps/app1
- **App 2 - Attack Metrics**: http://localhost:3000/apps/app2  
- **App 3 - Shooting Analysis**: http://localhost:3000/apps/app3

Cada aplicación:
- ✅ Requiere login con licencia válida
- ✅ Verifica sesión activa (solo 1 dispositivo a la vez)
- ✅ Muestra el nombre del usuario actual
- ✅ Permite volver al dashboard

### 7. Panel de Administración

Accede a http://localhost:3000/admin para:
- Ver todos los usuarios
- Ver días restantes de licencia
- Ver estado de conexión (en línea/desconectado)

## 📦 Deployment en Vercel

1. **Sube tu código a GitHub**

2. **Crea un proyecto en Vercel**
   - Conecta tu repositorio
   - Vercel detectará Next.js automáticamente

3. **Agrega Vercel Postgres**
   - En el dashboard de Vercel → Storage → Create Database → Postgres
   - Vercel configurará DATABASE_URL automáticamente

4. **Configura Variables de Entorno**
   ```
   NEXTAUTH_URL=https://tu-dominio.vercel.app
   NEXTAUTH_SECRET=tu-secreto-generado
   ```

5. **Ejecuta Prisma en Producción**
   ```bash
   npx prisma db push
   ```

6. **Crea el primer usuario admin**
   Desde tu terminal local conectado a la DB de producción:
   ```bash
   DATABASE_URL="tu-url-de-vercel" npx tsx scripts/create-admin.ts
   ```

7. **Deploy**
   - Push a GitHub
   - Vercel desplegará automáticamente

## 🔐 Seguridad

- Las contraseñas se almacenan con bcrypt (10 rounds)
- Las sesiones usan JWT tokens seguros
- Solo 1 dispositivo puede estar activo a la vez (timeout: 60 segundos)
- Los usuarios sin licencia activa no pueden acceder
- Middleware protege todas las rutas /dashboard y /apps

## 📱 Uso del Sistema

### Para Usuarios:
1. Login con usuario/contraseña
2. Accede al dashboard
3. Selecciona una de las 3 apps
4. Trabaja normalmente - tus datos se guardan en cada app
5. El sistema mantiene tu sesión activa (heartbeat automático)

### Para Administradores:
1. Todo lo anterior +
2. Acceso al panel admin
3. Visualización de todos los usuarios
4. Monitoreo de licencias y días restantes
5. Ver estado de conexión en tiempo real

## 🛠️ Añadir Nuevos Usuarios

Como admin, puedes crear scripts o APIs para:
- Registrar nuevos usuarios
- Asignar licencias de 1 año
- Renovar licencias existentes
- Desactivar usuarios

Ejemplo de creación programática:
```typescript
const user = await prisma.user.create({
  data: {
    username: "nuevo_usuario",
    email: "usuario@example.com",
    passwordHash: await bcrypt.hash("password", 10),
    role: "USER",
    licenses: {
      create: {
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        isActive: true
      }
    }
  }
});
```

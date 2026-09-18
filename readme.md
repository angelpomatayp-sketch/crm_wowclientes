# CRM WOW

Sistema CRM para gestión comercial: clientes, cotizaciones, órdenes y facturas.

---

## Levantar los servicios

### Requisitos previos
- XAMPP corriendo (Apache + MySQL activos)
- Node.js instalado

### 1. Base de datos
1. Abrir XAMPP Control Panel → Start **Apache** y **MySQL**
2. La base de datos `crm_wow` se crea automáticamente al iniciar el backend

### 2. Backend (API)
```bash
cd c:/xampp/htdocs/crm_wow/backend
npm install          # solo la primera vez
node server.js       # levanta en http://localhost:3001
```

### 3. Frontend (React)
```bash
cd c:/xampp/htdocs/crm_wow/frontend
npm install          # solo la primera vez
npm run dev          # levanta en http://localhost:5173
```

### 4. Acceder al sistema
Abrir en el navegador: **http://localhost:5173**

---

## Credenciales de acceso (entorno local)

Usuarios de ejemplo (solo para desarrollo local):

### Administrador
| Campo | Valor |
|-------|-------|
| Email | admin@wowtechperu.com |
| Contraseña | password.123 |
| Rol | admin |

### Ejecutivo (demo)
| Campo | Valor |
|-------|-------|
| Email | ejecutivo@crmwow.com |
| Contraseña | admin123 |
| Rol | ejecutivo |

Recomendaciones:
- Cambiar credenciales inmediatamente después del primer ingreso.
- No usar estas credenciales en producción.

---

## Configuración

### Backend (`backend/.env`)
```
PORT=3001
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=crm_wow
DB_USER=root
DB_PASS=
JWT_SECRET=crm_wow_secret_2026_super_seguro
JWT_EXPIRES_IN=8h
DB_SYNC_ALTER=false
```

### Frontend
- Dev: `http://localhost:5173`
- Las llamadas a `/api/*` se proxean automáticamente al backend en `localhost:3001`

---

## Estructura del sistema

### Flujo principal
```
Ejecutivo
   ↓
Cliente (empresa)
   ↓
Contacto (persona dentro de la empresa)
   ↓
Cotización  →  Orden de compra  →  Factura
```

### Módulos
| Módulo | Ruta | Roles |
|--------|------|-------|
| Dashboard | `/` | todos |
| Clientes | `/clientes` | todos |
| Detalle cliente | `/clientes/:id` | todos |
| Cotizaciones | `/cotizaciones` | todos |
| Detalle cotización | `/cotizaciones/:id` | todos |
| Órdenes | `/ordenes` | todos |
| Facturas | `/facturas` | todos |
| Actividades | `/actividades` | todos |
| Pipeline | `/pipeline` | todos |
| Recordatorios | `/recordatorios` | todos |
| Reportes | `/reportes` | todos |
| Ejecutivos | `/ejecutivos` | admin |
| Configuración | `/configuracion` | admin |

### Estados de cotización
```
borrador → enviado → aprobado
                  ↘ rechazado → borrador
```

### Tipos de cliente (se crean desde Configuración)
Cada tipo puede tener múltiples categorías.
Ejemplo:
- Gobierno → Ministerios, Municipalidades
- Privado → MYPE, Gran empresa

---

## Entidades principales

### Cliente
- RUC, razón social, nombre comercial
- Dirección, teléfono, web
- Tipo de cliente + categoría
- Ejecutivo asignado

### Contactos del cliente
- Nombre, cargo, área
- Correo, celular, teléfono
- Flag contacto principal

### Cotización
- Número auto-generado
- Cliente + contacto específico
- Ítems con cantidad, precio unitario
- IGV 18% calculado automáticamente
- Estado con flujo de aprobación

### Reportes disponibles (próximamente)
- Ventas por ejecutivo
- Cotizaciones enviadas
- Pipeline de oportunidades

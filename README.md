# Pizzería BI

Proyecto de un **taller de inteligencia de negocios** enfocado en la gestión de una pizzería. Esta aplicación permite registrar ventas, administrar el catálogo y visualizar indicadores clave en un dashboard.

## Características

- Registro de ventas en tiempo real con validaciones de precios y cantidades.
- Panel de BI con KPIs, tendencias y top de pizzas.
- Gestión de catálogo (sabores, tamaños, precios) y sedes.
- Integración con PostgreSQL vía Prisma.

## Stack

- Next.js (App Router)
- React + TypeScript
- Tailwind CSS
- Prisma + PostgreSQL

## Requisitos

- Node.js 18+ (o compatible)
- Base de datos PostgreSQL

## Configuración

1. Crea un archivo `.env` con la variable `DATABASE_URL` apuntando a tu PostgreSQL.
2. Instala dependencias:

```bash
npm install
```

3. Ejecuta el proyecto en desarrollo:

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Estructura principal

- `app/` rutas y vistas
- `app/admin/` panel de administración
- `app/ventas/` registro de ventas
- `app/dashboard/` indicadores de BI
- `lib/prisma.ts` cliente de Prisma
- `prisma/schema.prisma` modelo de datos

## Despliegue en Vercel

1. Importa el repositorio en Vercel.
2. Agrega `DATABASE_URL` en **Settings > Environment Variables**.
3. Haz deploy.

## Notas de seguridad

- No subas `.env` al repositorio.
- Rota credenciales si alguna clave se ha compartido.

# HSE Management Platform

<p align="center">
  <strong>Plataforma de Gestion de Seguridad, Salud y Medio Ambiente</strong><br>
  <em>Health, Safety & Environment Management System</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?logo=next.js" alt="Next.js 14">
  <img src="https://img.shields.io/badge/TypeScript-5-blue?logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma" alt="Prisma">
  <img src="https://img.shields.io/badge/Tailwind-CSS-38B2AC?logo=tailwindcss" alt="Tailwind CSS">
</p>

---

## Overview

Enterprise-grade platform for managing workplace safety incidents, corrective actions, and regulatory compliance. Built for organizations operating in Mexico and internationally, with full **Spanish/English** bilingual support.

### Key Features

| Module | Description |
|--------|-------------|
| **Incident Registry** | Auto-numbered events (EVT-YYYY-NNNN), severity classification, multi-site tracking |
| **Corrective Actions** | Assignment, deadline tracking, SLA traffic lights, completion workflow |
| **Investigations** | 5 Whys methodology, Cause Tree analysis, root cause documentation |
| **Dashboard** | Real-time KPIs, charts by type/severity/site, weekly trends |
| **Reports** | Export to Excel (.xlsx) and PDF with date/type/severity filters |
| **Admin** | Catalog management (sites, areas, shifts, contractors), user CRUD |
| **RBAC** | 5 roles: Reporter, Supervisor, HSE, Manager, Admin |
| **i18n** | Full Spanish/English language switching |
| **Dark Mode** | Accessibility-focused theme toggle |

---

## Tech Stack

- **Frontend:** Next.js 14 (App Router), React 18, Tailwind CSS, shadcn/ui, Radix UI
- **Backend:** Next.js API Routes, NextAuth.js (JWT), Prisma ORM
- **Database:** PostgreSQL 16
- **Charts:** Recharts
- **Exports:** jsPDF, xlsx
- **Email:** Nodemailer + Mailhog (dev)
- **Design:** "Industrial Precision" system with Plus Jakarta Sans, dark sidebar, amber accents

---

## Getting Started

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/habibherrera/hse-management.git
cd hse-management

# Install dependencies
npm install

# Start PostgreSQL
docker compose up -d

# Set up environment variables
cp .env.example .env
# Edit .env with your database URL if needed

# Run database migrations
npx prisma db push

# Generate Prisma client
npx prisma generate

# Seed demo data
npx tsx prisma/seed.ts

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Demo Credentials

| Email | Password | Role |
|-------|----------|------|
| admin@empresa.com | admin123 | Admin |
| hse@empresa.com | admin123 | HSE |
| supervisor@empresa.com | admin123 | Supervisor |
| gerente@empresa.com | admin123 | Manager |
| reportante@empresa.com | admin123 | Reporter |

---

## Project Structure

```
hse-management/
├── prisma/
│   ├── schema.prisma          # Database schema (12+ models)
│   ├── seed.ts                # Demo data seeder
│   └── seed-test-data.ts      # Test data generator
├── src/
│   ├── app/
│   │   ├── (auth)/login/      # Authentication
│   │   ├── (main)/            # Protected routes
│   │   │   ├── dashboard/     # KPI dashboard
│   │   │   ├── events/        # Incident management
│   │   │   ├── reports/       # Export module
│   │   │   └── admin/         # Catalogs & users
│   │   └── api/               # REST API routes
│   ├── components/
│   │   ├── dashboard/         # Chart components
│   │   ├── events/            # Event forms & lists
│   │   ├── layout/            # Sidebar, theme, i18n
│   │   └── ui/                # shadcn/ui primitives
│   ├── lib/                   # Auth, Prisma, validations, SLA
│   ├── messages/              # i18n translations (es/en)
│   └── providers/             # Theme & i18n context
├── docker-compose.yml         # Dev: PostgreSQL + Mailhog
├── docker-compose.prod.yml    # Production deployment
└── Dockerfile                 # Production build
```

---

## Production Deployment

```bash
# Build and run with Docker
docker compose -f docker-compose.prod.yml up -d --build
```

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://hse:hse_dev@localhost:5432/hse_db` |
| `NEXTAUTH_SECRET` | JWT signing secret | — |
| `NEXTAUTH_URL` | App URL | `http://localhost:3000` |
| `SMTP_HOST` | Email server host | `localhost` |
| `SMTP_PORT` | Email server port | `1025` |

---

## License

Private — All rights reserved.

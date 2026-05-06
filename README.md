
# UniPath AI
**The Intelligent Bridge to Global Education for Iraqi Students**

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06b6d4?style=flat-square&logo=tailwindcss" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Prisma-ORM-2d3748?style=flat-square&logo=prisma" alt="Prisma" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="License" />
</p>

---

## Overview

UniPath AI is a full-stack intelligent web application that streamlines and automates the university admission process for **Iraqi, Arab, and Western universities**. It transforms a student's academic and personal data into optimized university recommendations and automatically handles application form filling and submission workflows.

## Key Features

### 🎯 Smart Matching Engine
- AI-powered normalization of **Iraqi percentage grades to Global 4.0 GPA** scale
- Supports **5 grading systems**: 4.0, 5.0, 10.0, 20.0, and Percentage (100)
- Weighted scoring: GPA (35%), Budget (20%), Language (15%), Location (10%), Field (10%), Degree (5%), Acceptance Rate (5%)
- Categorized recommendations: **Safe**, **Target**, **Reach**

### 🌍 Global University Database
- **50+ universities** across 6 regions
  - 🇮🇶 **Iraq** (10): Baghdad, Mosul, Basrah, Technology, Kufa, Babylon, Kirkuk, Duhok, AUI-Sulaimani, Erbil
  - 🇦🇪🇱🇧🇶🇦 **Gulf/Arab** (10): AUS Sharjah, AUB Beirut, Qatar Univ., Khalifa, Univ. of Dubai, King Saud, AUC Cairo, UAE Univ., JUST, Univ. of Jordan
  - 🇩🇪🇦🇹🇨🇿 **Europe** (12): TU Munich, LMU Munich, Vienna, Charles, Warsaw, Bologna, Sorbonne, Amsterdam, KU Leuven, Lund, Copenhagen, Helsinki
  - 🇬🇧 **UK** (6): Oxford, Cambridge, Imperial, UCL, Edinburgh, Manchester
  - 🇺🇸🇨🇦 **North America** (6): MIT, Stanford, Harvard, Toronto, UBC, McGill
  - 🇹🇷🇲🇾 **Asia** (6): Boğaziçi, METU, Istanbul Tech, Malaya, UTM, Taylor's

### 📄 AI Document Generation
- Personal Statements tailored per university
- Motivation Letters with program-specific content
- Academic CVs in structured HTML format
- Powered by LLM with student context awareness

### 📊 What-If Simulator
- Test GPA changes, budget adjustments, and country preferences
- Real-time comparison: Current vs Simulated profile
- Identify new matches and lost matches instantly

### 📋 Application Tracker
- Full pipeline: Draft → Submitted → Under Review → Accepted/Rejected/Waitlisted
- Document status tracking
- One-click AI content generation per application

### 🔍 Document Processing (OCR)
- Automated extraction of certificate data
- Transcript parsing and GPA calculation
- Passport and ID scanning support

### 💳 Local Payments
- ZainCash integration for Iraqi students
- QiCard payment gateway support
- Secure and familiar local payment methods

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript 5 |
| **Frontend** | React 19, shadcn/ui, Framer Motion |
| **Styling** | Tailwind CSS 4 |
| **Backend** | Next.js API Routes |
| **Database** | SQLite + Prisma ORM |
| **State** | Zustand |
| **AI** | z-ai-web-dev-sdk (LLM) |
| **Icons** | Lucide React |

## Getting Started

### Prerequisites
- Node.js 18+ or Bun runtime
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/firaseth/unipath-ai.git
cd unipath-ai

# Install dependencies
bun install

# Set up database
cp .env.example .env
bun run db:push

# Start development server
bun run dev
```

The application will be available at `http://localhost:3000`.

### Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="file:./db/custom.db"
```

## Project Structure

```
unipath-ai/
├── prisma/
│   └── schema.prisma          # Database schema (5 models)
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout with metadata
│   │   ├── page.tsx            # Main SPA page
│   │   ├── globals.css         # Emerald/teal theme
│   │   └── api/
│   │       ├── profile/        # Student profile CRUD
│   │       ├── universities/   # University listing + seed
│   │       ├── recommendations/ # AI matching results
│   │       ├── simulate/       # What-if scenario testing
│   │       ├── generate/       # AI document generation
│   │       ├── applications/   # Application tracking
│   │       └── documents/      # Document processing
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   └── unipath/            # App-specific components
│   │       ├── WelcomeView.tsx
│   │       ├── ProfileForm.tsx
│   │       ├── RecommendationsView.tsx
│   │       ├── DocumentsView.tsx
│   │       ├── ApplicationsView.tsx
│   │       ├── SimulateView.tsx
│   │       ├── StepNavigation.tsx
│   │       ├── MatchScoreGauge.tsx
│   │       ├── ScoreBar.tsx
│   │       └── CategoryBadge.tsx
│   ├── store/
│   │   └── app-store.ts        # Zustand state management
│   └── lib/
│       ├── db.ts               # Prisma client
│       ├── gpa-normalizer.ts   # GPA normalization engine
│       ├── matching-engine.ts  # University matching algorithm
│       └── university-data.ts  # 50 university seed records
├── public/
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## Database Models

| Model | Description |
|-------|-------------|
| **Student** | Academic profile, GPA, preferences, language scores |
| **University** | Requirements, costs, rankings, programs, visa info |
| **Recommendation** | Match results with scores and categories |
| **Application** | Application tracking with generated documents |
| **Document** | Uploaded files with OCR extraction status |

## User Flow

```
Welcome → Profile → Matches → Documents → Applications → Simulate
  │          │         │          │           │           │
  ▼          ▼         ▼          ▼           ▼           ▼
 Features   3-step    Safe/     Upload     Create &    What-if
 overview   form      Target/   & parse    generate    scenario
            with GPA  Reach     certs      AI docs     testing
            normalize cards
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/profile` | List all student profiles |
| `POST` | `/api/profile` | Create student profile with GPA normalization |
| `GET` | `/api/universities?action=seed` | Seed 50 universities |
| `GET` | `/api/universities` | List universities with filters |
| `POST` | `/api/recommendations` | Generate AI-powered matches |
| `POST` | `/api/simulate` | Run what-if scenario |
| `POST` | `/api/generate` | Generate AI documents |
| `GET` | `/api/applications` | List applications |
| `POST` | `/api/applications` | Create application |
| `PUT` | `/api/applications` | Update application status |
| `POST` | `/api/documents` | Process uploaded documents |

## Scripts

```bash
bun run dev          # Start development server (port 3000)
bun run build        # Build for production
bun run start        # Start production server
bun run lint         # Run ESLint
bun run db:push      # Push schema to database
bun run db:generate  # Generate Prisma client
```

## License

This project is licensed under the MIT License.

---

<p align="center">
  Built with ❤️ for Iraqi and Arab students worldwide
</p>

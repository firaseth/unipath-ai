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

### ًںژ¯ Smart Matching Engine
- AI-powered normalization of **Iraqi percentage grades to Global 4.0 GPA** scale
- Supports **5 grading systems**: 4.0, 5.0, 10.0, 20.0, and Percentage (100)
- Weighted scoring: GPA (35%), Budget (20%), Language (15%), Location (10%), Field (10%), Degree (5%), Acceptance Rate (5%)
- Categorized recommendations: **Safe**, **Target**, **Reach**

### ًںŒچ Global University Database
- **50+ universities** across 6 regions
  - ًں‡®ًں‡¶ **Iraq** (10): Baghdad, Mosul, Basrah, Technology, Kufa, Babylon, Kirkuk, Duhok, AUI-Sulaimani, Erbil
  - ًں‡¦ًں‡ھًں‡±ًں‡§ًں‡¶ًں‡¦ **Gulf/Arab** (10): AUS Sharjah, AUB Beirut, Qatar Univ., Khalifa, Univ. of Dubai, King Saud, AUC Cairo, UAE Univ., JUST, Univ. of Jordan
  - ًں‡©ًں‡ھًں‡¦ًں‡¹ًں‡¨ًں‡؟ **Europe** (12): TU Munich, LMU Munich, Vienna, Charles, Warsaw, Bologna, Sorbonne, Amsterdam, KU Leuven, Lund, Copenhagen, Helsinki
  - ًں‡¬ًں‡§ **UK** (6): Oxford, Cambridge, Imperial, UCL, Edinburgh, Manchester
  - ًں‡؛ًں‡¸ًں‡¨ًں‡¦ **North America** (6): MIT, Stanford, Harvard, Toronto, UBC, McGill
  - ًں‡¹ًں‡·ًں‡²ًں‡¾ **Asia** (6): Boؤںaziأ§i, METU, Istanbul Tech, Malaya, UTM, Taylor's

### ًں“„ AI Document Generation
- Personal Statements tailored per university
- Motivation Letters with program-specific content
- Academic CVs in structured HTML format
- Powered by LLM with student context awareness

### ًں“ٹ What-If Simulator
- Test GPA changes, budget adjustments, and country preferences
- Real-time comparison: Current vs Simulated profile
- Identify new matches and lost matches instantly

### ًں“‹ Application Tracker
- Full pipeline: Draft â†’ Submitted â†’ Under Review â†’ Accepted/Rejected/Waitlisted
- Document status tracking
- One-click AI content generation per application

### ًں”چ Document Processing (OCR)
- Automated extraction of certificate data
- Transcript parsing and GPA calculation
- Passport and ID scanning support

### ًں’³ Local Payments
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
â”œâ”€â”€ prisma/
â”‚   â””â”€â”€ schema.prisma          # Database schema (5 models)
â”œâ”€â”€ src/
â”‚   â”œâ”€â”€ app/
â”‚   â”‚   â”œâ”€â”€ layout.tsx          # Root layout with metadata
â”‚   â”‚   â”œâ”€â”€ page.tsx            # Main SPA page
â”‚   â”‚   â”œâ”€â”€ globals.css         # Emerald/teal theme
â”‚   â”‚   â””â”€â”€ api/
â”‚   â”‚       â”œâ”€â”€ profile/        # Student profile CRUD
â”‚   â”‚       â”œâ”€â”€ universities/   # University listing + seed
â”‚   â”‚       â”œâ”€â”€ recommendations/ # AI matching results
â”‚   â”‚       â”œâ”€â”€ simulate/       # What-if scenario testing
â”‚   â”‚       â”œâ”€â”€ generate/       # AI document generation
â”‚   â”‚       â”œâ”€â”€ applications/   # Application tracking
â”‚   â”‚       â””â”€â”€ documents/      # Document processing
â”‚   â”œâ”€â”€ components/
â”‚   â”‚   â”œâ”€â”€ ui/                 # shadcn/ui components
â”‚   â”‚   â””â”€â”€ unipath/            # App-specific components
â”‚   â”‚       â”œâ”€â”€ WelcomeView.tsx
â”‚   â”‚       â”œâ”€â”€ ProfileForm.tsx
â”‚   â”‚       â”œâ”€â”€ RecommendationsView.tsx
â”‚   â”‚       â”œâ”€â”€ DocumentsView.tsx
â”‚   â”‚       â”œâ”€â”€ ApplicationsView.tsx
â”‚   â”‚       â”œâ”€â”€ SimulateView.tsx
â”‚   â”‚       â”œâ”€â”€ StepNavigation.tsx
â”‚   â”‚       â”œâ”€â”€ MatchScoreGauge.tsx
â”‚   â”‚       â”œâ”€â”€ ScoreBar.tsx
â”‚   â”‚       â””â”€â”€ CategoryBadge.tsx
â”‚   â”œâ”€â”€ store/
â”‚   â”‚   â””â”€â”€ app-store.ts        # Zustand state management
â”‚   â””â”€â”€ lib/
â”‚       â”œâ”€â”€ db.ts               # Prisma client
â”‚       â”œâ”€â”€ gpa-normalizer.ts   # GPA normalization engine
â”‚       â”œâ”€â”€ matching-engine.ts  # University matching algorithm
â”‚       â””â”€â”€ university-data.ts  # 50 university seed records
â”œâ”€â”€ public/
â”œâ”€â”€ package.json
â”œâ”€â”€ tailwind.config.ts
â””â”€â”€ tsconfig.json
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
Welcome â†’ Profile â†’ Matches â†’ Documents â†’ Applications â†’ Simulate
  â”‚          â”‚         â”‚          â”‚           â”‚           â”‚
  â–¼          â–¼         â–¼          â–¼           â–¼           â–¼
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
  Built with â‌¤ï¸ڈ for Iraqi and Arab students worldwide
</p>

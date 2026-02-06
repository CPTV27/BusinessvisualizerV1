# SUPERCHASE PLATFORM ARCHITECTURE
## The Definitive Map of Everything We're Building

> **Last Updated**: 2026-02-06
> **Maintained By**: CC (Claude Code)
> **Read By**: AG (Antigravity/Cursor), GA (Google AI Studio), Chase

---

## THE BIG PICTURE (Never Lose Sight of This)

```
 SUPERCHASE.APP
 The Operating System for Chase Pierson Productions
 ============================================================
 |                                                            |
 |   SIDEKICK (The Brain)                                    |
 |   Marketing automation, agent orchestration,              |
 |   relationship management, outreach                       |
 |                                                            |
 |   THE STUDIO (The Experience Layer)                       |
 |   Immersive 3D client environments,                       |
 |   AI-generated worlds, interactive business models        |
 |                                                            |
 |   +-------------------------------------------------+     |
 |   | TENANT: Big Muddy Blues Hotels                   |     |
 |   | (First client - boutique hotel + live venue)     |     |
 |   +-------------------------------------------------+     |
 |   | TENANT: [Future Client 2]                        |     |
 |   +-------------------------------------------------+     |
 |   | TENANT: [Future Client N]                        |     |
 |   +-------------------------------------------------+     |
 |                                                            |
 |   VOICE COMMAND CENTER                                    |
 |   Multi-agent orchestration (GPT-5, Claude, Gemini, Grok)|
 |                                                            |
 ============================================================
```

**SuperChase is the OS. SIDEKICK is the brain. The Studio is the UI. Big Muddy is the first tenant.**

---

## FORENSIC ANALYSIS: The True Intention

### What Chase Actually Built (and What It Means)

**Phase 1: The Vision (Jan 31, 2026)**
Chase started two repos on the same day:
- `TheBigMuddy_SIDEKICK` — A Flask/Python AI marketing agent system
- `sidekick-marketing-site` — A static marketing site

The first commit message: "SIDEKICK: AI marketing operations platform"

**True Intention**: Chase wasn't building a hotel website. He was building an **AI operations platform** that happens to serve a hotel. The hotel is the USE CASE, not the PRODUCT.

**Phase 2: The Expansion (Jan 31 - Feb 5)**
Marketing site evolution tells the story in commit messages:
1. "Initial static site for SIDEKICK partner marketing"
2. "Redesign site with Southern Gothic dark aesthetic"
3. "Add ecosystem/network visualization page"
4. "Add sponsors page with underwriting tiers"
5. "Expand vision to Blues & Roots (including Jazz and Americana)"
6. "Add SIDEKICK system architecture diagram"
7. "Add SIDEKICK admin dashboard interface"
8. "Switch from Supabase to Google Sheets for data"
9. "Add AI Assistant page with Gemini integration"
10. "Add Mississippi Corridor data, Tour Bus section"
11. "Add QA Dashboard and fix assistant issues"

**True Intention**: The "marketing site" evolved from a static page into a FULL OPERATIONAL DASHBOARD with AI assistants, data pipelines, tour operations, QA, and admin controls. Chase kept adding capabilities because the vision kept expanding.

**Phase 3: The Realization (Feb 5)**
Two things happened on Feb 5:
1. The `Deltadawn discovery App` was created with the original Excel Discovery Model
2. `BusinessvisualizerV1` (The Studio) was initialized

The Discovery Model spreadsheet is the Rosetta Stone. It contains the 4-layer business architecture (Foundation, Machine, Network, Business) that maps every entity in Big Muddy's ecosystem.

**True Intention**: Chase realized he needed a VISUAL, INTERACTIVE tool to model complex multi-layered businesses — not just another dashboard. The Studio was born to make business strategy feel tangible.

**Phase 4: The Convergence (Feb 5-6, This Session)**
Chase revealed superchase.app already exists as a voice command center with 1,390 visitors. It orchestrates 4 AI agents. Then he said:

> "I want AI to generate images that we can then generate immersive 3D worlds and environments in based as the images and input, and then start adding things to the immersive world."

And:

> "i want immersive experiences not boxes and words"

**True Intention**: Chase has been building toward a single vision from day one:

**An AI-powered creative operations platform where business strategy, marketing automation, and client experiences all live inside immersive, AI-generated environments — controlled by voice, managed by agents, experienced in 3D.**

The flat dashboards were stepping stones. The spreadsheets were data sources. The agents were the brain. The voice UI was the interface. Now he wants to FUSE it all into something nobody has built before.

---

## PROJECT INVENTORY (The Chaos, Documented)

### Active Projects

| # | Project | Location | Purpose | Status | Agent Owner |
|---|---------|----------|---------|--------|-------------|
| 1 | **BusinessVisualizerV1** | `/superchase/` | The Studio - immersive 3D client experience | Active Dev | AG (3D), CC (services), GA (types) |
| 2 | **TheBigMuddy_SIDEKICK** | `/projects/` | SIDEKICK agent backend (Flask/Python) | Working | CC (via MCP) |
| 3 | **sidekick-marketing-site** | `/projects/` | Big Muddy operational dashboard | Active Dev | AG |
| 4 | **SIDEKICK-MCP** | `/projects/` | Claude <-> SIDEKICK bridge | Working | CC |

### Supporting Projects

| # | Project | Location | Purpose | Status |
|---|---------|----------|---------|--------|
| 5 | **sidekick-docs** | `/projects/` | Docusaurus documentation | Built, deployed |
| 6 | **sidekick (Electron)** | `/projects/` | Desktop client prototype | Dormant (no commits) |
| 7 | **Scan2Plan-Sidekick** | `/projects/` | LIDAR business dashboard template | Complete (reference) |

### Origin Artifacts

| # | Project | Location | Purpose | Status |
|---|---------|----------|---------|--------|
| 8 | **Deltadawn discovery App** | `/projects/` | Original Discovery Model (Excel + HTML) | Origin artifact |
| 9 | **sidekick-site** | `/projects/` | "sidekick-mcp-server" (MISNAMED) | Actually MCP server |

### External (Deployed)

| # | Domain | What's There | Status |
|---|--------|--------------|--------|
| 10 | **superchase.app** | Voice Command Center (multi-agent orchestration) | Live, 1.39k visitors |
| 11 | **monumentaltaco.com** | Parked Cloudflare page | Unused |
| 12 | **sidekick-bigmuddy.web.app** | Firebase hosting (marketing site + docs) | Live |

---

## NAMING INCONSISTENCIES (The Chaos)

| Current Name | Actual Identity | Should Be Called |
|---|---|---|
| `sidekick-site` | MCP server for SIDEKICK API | `sidekick-mcp-server` |
| `sidekick-marketing-site` | Full operational dashboard | `bigmuddy-operations` or `studio-dashboard` |
| `sidekick-docs` + `sidekick-marketing-site` | Both deploy to `sidekick-bigmuddy` Firebase | Need separate Firebase targets |
| `BusinessvisualizerV1` | The Studio module of SuperChase | `the-studio` (package.json already says "the-studio:-big-muddy") |
| `Deltadawn discovery App` | Origin Discovery Model artifact | `discovery-model-origin` |

---

## TECHNOLOGY STACK MAP

### Per-Project Tech

```
SuperChase.app (deployed)
  ├── Frontend: Voice orb UI, agent cards
  ├── Backend: Replit (inferred from live site)
  └── AI: GPT-5, Claude, Gemini, Grok orchestration

TheBigMuddy_SIDEKICK (Python backend)
  ├── Framework: Flask + SQLAlchemy
  ├── Scheduler: APScheduler
  ├── AI: xAI Grok API
  ├── Database: SQLite (20+ tables)
  └── Agents: 6 specialized (Research, Scoring, Draft, Outreach, Analytics, Nurture)

SIDEKICK-MCP (bridge)
  ├── Framework: Node.js + MCP SDK
  ├── Communication: stdio (Claude) + HTTP (SIDEKICK API)
  └── Validation: Zod schemas

BusinessVisualizerV1 / The Studio (frontend)
  ├── Framework: React 19 + TypeScript + Vite
  ├── 3D: Three.js + React Three Fiber + Drei
  ├── AI: Google Generative AI (Gemini)
  ├── Data: Google Sheets API (Discovery Model)
  └── Hosting: Firebase (sidekick-bigmuddy)

sidekick-marketing-site (operational dashboard)
  ├── Framework: React 19 + Vite
  ├── AI: Gemini
  ├── Maps: Mapbox GL
  ├── Database: Firebase Realtime / Firestore
  └── Testing: Playwright

sidekick (Electron desktop - dormant)
  ├── Framework: Electron 40 + React 19
  ├── AI: Anthropic SDK
  ├── Database: better-sqlite3
  └── Build: Electron Forge + Webpack
```

### Shared Dependencies
- **React 19.2.4**: Used in Studio, Marketing Site, Electron app
- **Vite**: Used in Studio, Marketing Site
- **Firebase**: Shared project `sidekick-bigmuddy`
- **Google Gemini**: Used in Studio, Marketing Site

---

## DATA FLOW

```
Discovery Model (Google Sheets)
  │
  ├──> BusinessVisualizerV1 (sheetsService.ts)
  │      Live sync, entity parsing, revenue projections
  │
  └──> Deltadawn Discovery App (origin .xlsx)
         Static snapshot, reference only

SIDEKICK Agent System (SQLite)
  │
  ├──> 49 prospects discovered
  ├──> 20 outreach drafts
  ├──> 10 campaign goals
  ├──> 26 completed agent tasks
  │
  └──> SIDEKICK-MCP ──> Claude Code
         25+ tools exposed for coordination

Firebase (sidekick-bigmuddy)
  │
  ├──> Firestore: Client data, entity persistence
  ├──> Auth: Google sign-in
  ├──> Hosting: Marketing site, docs
  └──> Realtime DB: Tour data, AI assistant logs

Gemini API
  │
  ├──> Studio: Panoramic environment generation
  ├──> Studio: Gap solution generation
  ├──> Studio: Market analysis
  ├──> Studio: Chat (Entity Notebook)
  └──> Marketing Site: AI Assistant
```

---

## THE MULTI-AGENT DEVELOPMENT MODEL

### Agent Roles

| Agent | Tool | Role | Strengths |
|-------|------|------|-----------|
| **AG** (Antigravity) | Cursor + Opus 4.5 | 3D visuals, complex components, Firebase | Multi-file refactoring, visual UX |
| **CC** (Claude Code) | Claude Code Max | Services, data pipelines, architecture | System design, API integration, documentation |
| **GA** (Google AI Studio) | Gemini | Types, constants, AI prompts | Rapid prototyping, prompt engineering |

### File Ownership (Updated)

| Owner | Files | Rules |
|-------|-------|-------|
| **GA** | `types.ts`, `constants.ts`, `services/geminiService.ts` | Single-file edits only |
| **AG** | `src/components/*`, `src/services/*`, `src/contexts/*`, `vite.config.ts`, `package.json` | Complex multi-file work |
| **CC** | `services/sheetsService.ts`, `.env*`, `ARCHITECTURE.md`, `AGENT_LEDGER.md`, `REVENUE_MODEL.md` | Data services, documentation, coordination |
| **SHARED** | `App.tsx`, `index.css` | **Coordinate before editing** - this is where conflicts happen |

### Collision History
- **Feb 6**: Merge conflict in `App.tsx` imports. GA removed `scoutRegionalBusinesses`, AG kept it. Resolution: keep both. **Lesson**: App.tsx is a war zone. Coordinate.

---

## WHAT CONNECTS TO WHAT

```
superchase.app ─────────────────────────────────────┐
  │ (Voice commands, agent orchestration)            │
  │                                                   │
  ├── SIDEKICK Backend ◄── MCP Server ◄── Claude Code│
  │     │ (Python/Flask)    (Node.js)     (This agent)│
  │     │                                             │
  │     ├── Research Agent ──> Twitter, YouTube, Reddit│
  │     ├── Scoring Agent ──> Qualification (0-100)   │
  │     ├── Draft Agent ──> Message generation        │
  │     ├── Outreach Agent ──> Send tracking          │
  │     ├── Analytics Agent ──> Funnel metrics        │
  │     └── Nurture Agent ──> Relationship health     │
  │                                                   │
  ├── The Studio (BusinessVisualizerV1)              │
  │     │ (React + Three.js)                          │
  │     │                                             │
  │     ├── Immersive 3D Theme Selector              │
  │     ├── Strategic Entity Map                      │
  │     ├── AI Panoramic Environment Generator        │
  │     ├── Market Scout (regional analysis)          │
  │     ├── Production Studio (Veo video gen)         │
  │     └── Google Sheets live sync                   │
  │                                                   │
  └── Big Muddy Operations Dashboard                 │
        (sidekick-marketing-site)                     │
        │                                             │
        ├── Tour Intelligence                         │
        ├── AI Assistant (Gemini)                     │
        ├── Charter Pipeline                          │
        ├── QA Dashboard                              │
        └── Admin Controls                            │
──────────────────────────────────────────────────────┘
```

---

## DEPLOYMENT MAP

```
CLOUDFLARE (DNS)
  ├── superchase.app ──> [Current hosting TBD - likely Replit/Vercel]
  └── monumentaltaco.com ──> Parked (unused)

FIREBASE (sidekick-bigmuddy)
  ├── Hosting ──> sidekick-marketing-site
  ├── Hosting ──> sidekick-docs (CONFLICT: same project)
  ├── Firestore ──> Client data
  └── Auth ──> Google sign-in

GITHUB (CPTV27)
  ├── BusinessvisualizerV1 ──> The Studio
  ├── TheBigMuddy_SIDEKICK ──> Agent backend
  ├── sidekick-marketing-site ──> Operations dashboard
  └── sidekick-site ──> MCP server (misnamed)

LOCAL (Mac Mini)
  ├── Vite dev server (port 5173 or 3001) ──> The Studio
  ├── Flask server (port 5000/5003) ──> SIDEKICK backend
  └── MCP server (stdio) ──> Claude bridge

GOOGLE
  ├── Sheets ──> Discovery Model (live data)
  ├── Gemini API ──> AI generation
  └── Workspace ──> Calendar, Tasks, Chat, Gmail (pending OAuth)
```

---

## OPEN QUESTIONS

1. **Firebase hosting conflict**: `sidekick-docs` and `sidekick-marketing-site` both target `sidekick-bigmuddy`. Need separate hosting targets or merge into one.
2. **SuperChase.app hosting**: Where is the voice command center actually hosted? Replit? Vercel? We need to know to integrate Studio.
3. **Electron app**: Dormant with no commits. Kill it or revive it?
4. **monumentaltaco.com**: What was the original intention? Repurpose for something?
5. **1Password personal account**: Needs to be added to desktop app (me@chasepierson.tv) to unlock all API keys via CLI.
6. **Google Workspace OAuth**: Pending — needs browser on Mac Mini for localhost callback.

---

*This document is the single source of truth. When in doubt, read this first.*

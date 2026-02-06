# 🎭 The Studio — Parallel Development Manifest

## Overview
This document defines the collaboration model between:
- **Local Agent (Gemini CLI/Antigravity)**: Complex multi-file work, Firebase integration, architecture
- **AI Studio Agent**: Single-file prototyping, AI prompt engineering, rapid experiments
- **Human (Chase)**: Creative direction, testing, approval, business logic

---

## 🌿 Branch Strategy

```
main
├── feature/firebase-integration    ← Local Agent owns
├── feature/game-board-views        ← Local Agent owns  
├── feature/ai-enhancements         ← AI Studio owns
├── feature/themes-polish           ← Either (simple files)
└── feature/ambient-vibe            ← Either (simple files)
```

---

## 📂 File Ownership Matrix

### 🔒 LOCAL AGENT ONLY (Complex/Multi-file)
These files involve complex dependencies or multi-file coordination:
- `firebase.json` — Firebase configuration
- `firestore.rules` — Security rules
- `functions/` — Cloud Functions (if added)
- `src/contexts/` — React contexts (auth, data)
- `src/hooks/` — Custom hooks
- `src/services/firebaseService.ts` — Firebase SDK integration
- `src/services/sheetsService.ts` — Google Sheets API
- `vite.config.ts` — Build configuration
- `package.json` — Dependencies

### 🔓 AI STUDIO SAFE (Single-file, isolated)
These files can be edited in AI Studio without conflicts:
- `constants.ts` — Theme configs, entity data, prompts
- `types.ts` — TypeScript interfaces
- `services/geminiService.ts` — AI prompts and model calls
- `index.html` — HTML structure
- `public/` — Static assets (images, sounds)

### 🤝 SHARED (Coordinate before editing)
- `App.tsx` — Main component (high conflict risk)
- `index.css` / theme CSS — Styling

---

## 🎯 Current Sprint: "Connect the Foundation"

### Local Agent Tasks (Antigravity)
1. [ ] Connect to `sidekick-bigmuddy` Firebase project
2. [ ] Add Firebase Auth (Google sign-in)
3. [ ] Create Firestore schema for clients/entities
4. [ ] Build data persistence layer
5. [ ] Create 5 game board view components
6. [ ] Add ambient soundscapes + time-aware themes

### AI Studio Tasks
1. [ ] Improve `generateGapSolutions` prompt (more creative, actionable)
2. [ ] Add new entity types in `constants.ts` (all Big Muddy business units)
3. [ ] Create persona system prompts (The Collector, The Wanderer, etc.)
4. [ ] Test different Gemini model versions for each use case
5. [ ] Add "Inspiration Deck" prompts library

### Human Tasks (Chase)
1. [ ] Provide Discovery Model spreadsheet structure/sample
2. [ ] Confirm Firebase project access
3. [ ] Review and approve theme polish
4. [ ] Test on mobile devices

---

## 🔄 Sync Protocol

1. **Before AI Studio session**: Pull latest from GitHub
2. **AI Studio work**: Only edit files in "AI STUDIO SAFE" section
3. **After AI Studio session**: Commit with prefix `[studio]`
4. **Local Agent work**: Commit with prefix `[local]`
5. **Merge frequency**: Daily or after major features

---

## 📋 Big Muddy Entity Registry (for AI Studio to add)

Add these to `constants.ts`:

```typescript
// Business Units
- The Big Muddy Inn (VENUE) — 10-20 rooms, $199-$799/night
- Soul Kitchen (EXPERIENCE) — Restaurant + cocktail program
- Ari Aslin (BRAND) — Entertainment personality
- Hospitality Entertainment Group (VENUE) — Live venue operations
- Arkansas Development (DEVELOPMENT) — Expansion arm

// Room Categories
- Delta Standard
- Crossroads King  
- Juke Joint Suite
- Legendary Suite

// Show Schedule
- Blue Monday (free)
- Blues School (Wednesday)
- Headline (Friday)
- Double Feature (Saturday)
- Gospel & Gravy (Sunday)

// Artist Residency Tiers
- Emerging Artist
- Mid-Career Artist
- Master Artist

// Packages
- Bronze "Stay & Hear"
- Silver "Stay & Hear"  
- Gold "Stay & Hear"
```

---

## 🎨 Theme Enhancement Notes

### For AI Studio to experiment with in constants.ts:
- Add CSS custom properties for each theme
- Add animation easing curves per theme
- Add ambient sound file references
- Add time-of-day color overrides

### For Local Agent to implement:
- CSS variables injection system
- Audio playback system
- Time detection + theme interpolation

---

## 📡 Communication

- **Blockers**: Comment in code with `// @BLOCKED: reason`
- **Questions**: Comment with `// @QUESTION: what?`
- **Ready for merge**: Create PR with clear description

---

*Last updated: 2026-02-05*

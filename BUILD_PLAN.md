# Hogwarts House Points System — Build Plan

> ELVTR AI PM Test Task | Maksym Antoniuk | June 2026
> **Status: All clear — awaiting build approval.**

---

## 1. Project Understanding

**Product**: A role-based digital house points system replacing Hogwarts' enchanted hourglasses. Staff submit point transactions with mandatory reasons; everything is permanently audited; students can appeal unfair deductions; anti-abuse controls flag suspicious patterns; a live public dashboard shows standings in the Great Hall.

**Design system**: "The Candlelit Ledger" — dark parchment/candlelit aesthetic. Fonts: Cormorant Garamond (headings), IBM Plex Sans (body), IBM Plex Mono (numbers). Dark brown background with house accent colors.

**Prototype goal**: Prove the core product story in 3 connected screens, demoable in under 5 minutes.

---

## 2. Confirmed Prototype Scope

### Demo scenario
A Potions Professor docks 20 points from Gryffindor. The system flags a suspicious pattern. A student appeals. The Head of House approves it. A correction transaction restores the points. The Great Hall standings update.

### Three pages

| Route | Page | Purpose |
|---|---|---|
| `/dashboard` | Great Hall Dashboard | Live standings, recent activity, winner banner |
| `/points-entry` | Staff Points Entry | Role-based form, validation, anti-abuse warning |
| `/audit-appeals` | Audit & Appeals View | Immutable log, appeal queue, anti-abuse flags, correction history |

### Navigation flow
Dashboard → Points Entry → Points Entry (success + flag warning) → Dashboard → Audit & Appeals → Dashboard

---

## 3. Seed Data Status — Confirmed ✅

### Already in the DB
| Data | Confirmed value |
|---|---|
| School year ID | `aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa` ("2025-2026 House Cup") |
| Standings | Gryffindor 470 → Slytherin 465 → Ravenclaw 430 → Hufflepuff 410 |
| Banner | `winner_status = 'prepared_to_win'`, leading house = Gryffindor |
| Houses | IDs `1111…` Gryffindor, `2222…` Slytherin, `3333…` Ravenclaw, `4444…` Hufflepuff |
| Anti-abuse flag | ID `...0401`, open, severity = high, flagging Prof. Mallory for repeated Gryffindor deductions |

### Demo cast (confirmed user IDs)
| User | ID suffix | Role | House | Demo role |
|---|---|---|---|---|
| Prof. E. Mallory | `...0201` | Professor | Slytherin | **Potions professor — submits the -20 deduction** |
| M. Aldridge | `...0205` | Student | Gryffindor | **Student who gets deducted and appeals** |
| Head V. Wren | `...0206` | Head of House + Professor | Gryffindor | **Reviewer who approves the appeal** |
| Headmistress A. Rowan | `...0207` | Head of School | — | Available for unlimited-role demo |
| Prefect L. Quill | `...0203` | Prefect | Ravenclaw | Available for 5-point limit demo |

### Created live during the demo flow ⚡
| Event | Triggered by |
|---|---|
| -20 Gryffindor deduction | Staff Entry form → direct insert into `point_transactions` |
| Student appeal (pending) | Audit & Appeals → `create_student_appeal()` RPC |
| +20 correction transaction | Head of House approves → `approve_appeal_and_create_correction()` RPC |
| Dashboard standings update | Views recalculate automatically after each insert |

---

## 4. Supabase Integration Plan

### Views — use these first (pre-aggregated, no client-side joins)

| View | Used on | Purpose |
|---|---|---|
| `public_house_standings` | Dashboard | Ranked house totals for the live scoreboard |
| `current_winner_banner` | Dashboard | Banner state (`prepared_to_win` / `final_winner` / tie) |
| `recent_public_movements` | Dashboard | Last N point changes for the activity feed (public-safe, no student names) |
| `role_limits_view` | Points Entry | Role names + `point_limit` to drive form validation and display |

### Tables — query directly where views don't cover it

| Table | Used on | Purpose |
|---|---|---|
| `point_transactions` | Points Entry, Audit | Insert new transaction; fetch audit log |
| `appeals` | Audit & Appeals | Fetch appeal queue; show status, student note, reviewer note |
| `anti_abuse_flags` | Audit & Appeals | Open flags panel with severity and reason |
| `anti_abuse_flag_transactions` | Audit & Appeals | Link flags to the specific transactions that triggered them |
| `audit_events` | Audit & Appeals | System action log (role changes, overrides, etc.) |
| `users` | Points Entry, Audit | Staff/student name display; populate actor dropdowns |
| `roles` | Points Entry | Role metadata (used alongside `role_limits_view`) |
| `user_roles` | Points Entry | Active roles per user for the demo role switcher |
| `houses` | All pages | House names, slugs, colors |

### RPC functions — use for all state-changing appeal actions

| Function | Called from | What it does |
|---|---|---|
| `create_student_appeal(transaction_id, student_id, reason)` | Audit & Appeals | Inserts appeal record linked to a transaction |
| `approve_appeal_and_create_correction(appeal_id, reviewed_by, reviewer_note)` | Audit & Appeals | Approves appeal + creates the linked +20 correction transaction atomically |
| `reject_appeal(appeal_id, reviewed_by, reviewer_note)` | Audit & Appeals | Marks appeal rejected; no point change |

### Integration priority order
1. **Read from views** (`public_house_standings`, `current_winner_banner`, `recent_public_movements`, `role_limits_view`) — no manual aggregation
2. **Direct table reads** for audit log, appeals queue, anti-abuse flags, user/role lookups
3. **Direct table insert** for new `point_transactions` (Staff Entry form)
4. **RPC calls** for the appeal lifecycle (create → approve/reject)

### RLS
Prototype policies are already permissive for anon reads and inserts where needed. No auth or RLS hardening required.

---

## 5. Recommended Stack

```
React 18 + Vite 5 + TypeScript 5
Tailwind CSS v3 (with custom design tokens for the Candlelit Ledger palette)
@supabase/supabase-js v2
React Router v6 (3 routes + shared nav)
TanStack Query v5 (data fetching / cache)
Framer Motion v11 (point counter animations, state transitions — the design explicitly calls for "Motion that explains state")
```

**Why Framer Motion**: The design doc has a full section "Motion that explains state" with animated point counters, score changes, and transition animations. It's not decorative — it's how the product communicates live updates.

---

## 6. Environment Variables Required

Create a `.env.local` file at the project root (never commit this file):

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

`.env.local` is covered by `.gitignore`. Vite loads it automatically in dev and build.

---

## 7. Repo Setup (what the init will do)

```
Hogwarts/
├── src/
│   ├── main.tsx
│   ├── App.tsx              # Router + shell
│   ├── lib/
│   │   └── supabase.ts      # Supabase client init
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── PointsEntry.tsx
│   │   └── AuditAppeals.tsx
│   ├── components/          # Reusable pieces matching the 10 design components
│   │   ├── HouseCard.tsx
│   │   ├── PointCounter.tsx
│   │   ├── TransactionRow.tsx
│   │   ├── AppealCard.tsx
│   │   ├── AbuseFlag.tsx
│   │   ├── RoleSelector.tsx
│   │   ├── PointsForm.tsx
│   │   ├── WinnerBanner.tsx
│   │   └── Nav.tsx
│   └── types/               # TypeScript types matching the DB schema
│       └── db.ts
├── .env.local          # git-ignored — credentials only
├── index.html
├── tailwind.config.ts       # Candlelit Ledger tokens
├── vite.config.ts
└── tsconfig.json
```

---

## 8. Build Order

1. **Init project** — `npm create vite@latest . -- --template react-ts`
2. **Install deps** — Tailwind, Supabase client, React Router, TanStack Query, Framer Motion
3. **Configure Tailwind** — add house colors, Cormorant Garamond + IBM Plex fonts, dark background tokens
4. **Supabase client** — `src/lib/supabase.ts` with env vars
5. **Types** — `src/types/db.ts` matching schema tables
6. **Shell** — App.tsx with router, shared Nav between 3 pages
7. **Dashboard** — house standings, winner banner, recent activity feed
8. **Points Entry** — form with role switcher, validation, success + anti-abuse warning states
9. **Audit & Appeals** — transaction log, appeal queue with approve/reject actions, anti-abuse panel
10. **Animations** — Framer Motion on point counters (Dashboard) and state transitions (form submit)
11. **End-to-end test** — walk the 8-step demo path from the DOCX

---

## 9. Resolved Decisions

| Decision | Answer |
|---|---|
| Role switcher | Visible demo dropdown in the UI — no authentication |
| Fonts | Google Fonts CDN in `index.html` (Cormorant Garamond, IBM Plex Sans, IBM Plex Mono) |
| RLS | Confirmed permissive for anon reads/inserts — no changes needed |
| Seed data | Fully confirmed. Houses, users, roles, transaction history, anti-abuse flag all present. |
| Client-side aggregation | Not needed — all 4 views confirmed working and returning correct data |
| Supabase credentials | `.env.local` created, git-ignored ✅ |
| View column shapes | Introspected and confirmed ✅ (see Section 4) |
| `point_transactions` insert fields | Confirmed from seed rows: `school_year_id`, `transaction_type`, `house_id`, `student_id`, `points`, `reason`, `submitted_by`, `submitted_role_id`, `effective_at`, `source`, `metadata` |

## 10. RPC Functions — Resolved ✅

All three RPC functions are confirmed live and responding correctly with named parameters.

### Exact call signatures (use these verbatim in the frontend)

```ts
// Submit a student appeal against a transaction
supabase.rpc('create_student_appeal', {
  transaction_id,   // uuid
  student_id,       // uuid
  reason            // string
})

// Approve an appeal — atomically creates the correction transaction
supabase.rpc('approve_appeal_and_create_correction', {
  appeal_id,        // uuid
  reviewed_by,      // uuid
  reviewer_note     // string
})

// Reject an appeal — no point change
supabase.rpc('reject_appeal', {
  appeal_id,        // uuid
  reviewed_by,      // uuid
  reviewer_note     // string
})
```

### Confirmed behaviour (from live probes)
- `create_student_appeal` validates that the transaction exists before inserting
- `approve_appeal_and_create_correction` validates that the appeal exists before creating a correction
- `reject_appeal` enforces that only `pending` appeals can be rejected

Do not use direct `INSERT`/`UPDATE` for appeal actions — RPCs handle atomicity and validation.

## 11. Open Risks (low, noted for record)

| Item | Note |
|---|---|
| Design PDFs are image-based | The 3 design PDFs appear rasterized — building from the visible design screenshot and DOCX notes. Pixel-accuracy limited without Figma. |
| `tmp_pdf` folder | A temp Node.js folder exists in the project root from document reading. Will remove it at build start. |

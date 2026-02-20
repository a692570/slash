# Slash - Task Tracker 🔪

**Hackathon:** Autonomous Agents Hackathon SF, Feb 27, 2026
**Deadline:** 8 days from Feb 19
**Goal:** WIN. Ship a working demo that makes a real phone call and negotiates a bill down.

---

## Codebase State (as of Feb 19)

### What Actually Exists (5,061 lines total)
- **Backend (Express/TS):** Full route structure (`src/routes/api.ts` 813 lines), types (`src/types/index.ts` 542 lines)
- **Services:**
  - `voice.ts` (227 lines): Telnyx Call Control integration. Uses `ai_agent` param on call create. Has webhook handler, prompt builder. Looks functional but uses fictional Telnyx AI gather endpoints (`/actions/ai-gather`). **NEEDS REWRITE to use real Telnyx Voice AI / OpenAI Realtime.**
  - `research.ts` (183 lines): Tavily search integration. Parses competitor rates from search results. Looks functional.
  - `strategy.ts` (411 lines): Builds negotiation strategies from competitor data + graph leverage. Selects tactics by category. Generates scripts. **Solid logic, needs real data to test.**
  - `graph.ts` (509 lines): Neo4j knowledge graph. Stores providers, competitor rates, negotiation outcomes. Has `getLeverage()` for strategy engine. **Needs Neo4j instance.**
  - `storage.ts` (428 lines): In-memory storage for users, bills, negotiations. Full CRUD. **Works but dies on restart. Fine for demo.**
  - `scanner.ts` (280 lines): PDF credit card statement scanner. Uses `pdf-to-img` + regex parsing. **Nice-to-have, not critical path.**
- **Frontend (React):**
  - `Dashboard.tsx` (130 lines), `AddBill.tsx` (244 lines), `BillDetail.tsx` (237 lines)
  - `NegotiationLive.tsx` (310 lines): Live negotiation view with status updates
  - `ScanStatement.tsx` (305 lines): Statement upload + parse
  - `api/client.ts` (151 lines): API client for all endpoints
  - **No auth UI. No login/signup page.**
- **Landing page:** `index.html` deployed on GitHub Pages. Looks clean.
- **No deployment config:** No Dockerfile, render.yaml, or docker-compose.
- **No .env:** Only .env.example exists. No real credentials configured.

### Critical Issues
1. **Voice service uses fake Telnyx endpoints.** `ai_agent` param on `/v2/calls` and `/actions/ai-gather` don't exist. Need to use Telnyx Call Control + OpenAI Realtime API (WebSocket) for actual voice negotiation.
2. **No database.** In-memory only. Fine for demo but needs seeding on startup.
3. **No deployment.** Can't demo without deploying somewhere.
4. **No auth.** Backend has routes but no JWT, no login page.
5. **Neo4j not connected.** Graph service written but no instance provisioned.

---

## Task List

### 🔴 P0 - Must Have for Demo Day (Critical Path)

#### T1: Voice Agent Rewrite ⬜
**Owner:** TBD | **Est:** 2-3 days | **Blocked by:** Telnyx account setup
**What:** Rewrite `src/services/voice.ts` to use real Telnyx APIs.
**Approach:**
- Option A: Telnyx Call Control + OpenAI Realtime API (bidirectional WebSocket audio streaming). This is the real deal. Telnyx sends RTP audio via WebSocket, OpenAI processes it in realtime.
- Option B: Telnyx Voice API with pre-built AI features (if available). Simpler but less flexible.
**Files:** `src/services/voice.ts`, new `src/services/openai-realtime.ts`
**Acceptance:** Can make a real outbound call to a test number, AI speaks, listens, responds.
**Research needed:** Check Telnyx docs for Call Control WebSocket streaming + OpenAI Realtime API integration patterns.

#### T2: Telnyx Account Setup ⬜
**Owner:** Abhishek | **Est:** 30 min
**What:** Get Telnyx API key, buy a phone number, create a Call Control connection.
**Output:** Fill `.env` with real `TELNYX_API_KEY`, `TELNYX_PHONE_NUMBER`, `TELNYX_CONNECTION_ID`.
**Note:** Abhishek works at Telnyx so this should be quick.

#### T3: Deploy Backend (Render) ⬜
**Owner:** TBD | **Est:** 2-3 hours
**What:** Create `render.yaml` or `Dockerfile`. Deploy Express backend to Render free tier.
**Requirements:**
- Public URL for Telnyx webhooks
- Environment variables configured
- Health check endpoint already exists at `/health`
**Files:** New `render.yaml` or `Dockerfile`, update `package.json` scripts

#### T4: Deploy Frontend ⬜
**Owner:** TBD | **Est:** 1-2 hours
**What:** Deploy React frontend. Options: Render static site, Vercel, or just serve from Express.
**Simplest:** Serve built frontend from Express (`app.use(express.static('frontend/dist'))`)
**Files:** Update `src/index.ts`, add build script

#### T5: Demo Flow (End-to-End) ⬜
**Owner:** TBD | **Est:** 1 day
**What:** Wire the full happy path: Add bill > Research runs > Strategy built > Call initiated > Live updates > Result shown.
**This is the money shot for demo day.** Everything else supports this flow.

### 🟡 P1 - Should Have (Makes Demo Impressive)

#### T6: Neo4j Setup ⬜
**Owner:** TBD | **Est:** 2-3 hours
**What:** Provision Neo4j Aura Free instance. Seed with provider data. Connect `graph.ts`.
**Output:** Working knowledge graph that gets smarter with each negotiation.
**Can fake:** Hardcode leverage data in strategy engine if Neo4j is too slow to set up.

#### T7: Seed Demo Data ⬜
**Owner:** TBD | **Est:** 1-2 hours
**What:** Pre-populate storage with demo user, demo bills (Comcast $189/mo internet, T-Mobile $85/mo cell).
**Why:** Judges don't want to fill out forms. Start with data already there.
**Files:** New `src/seed.ts`, call from `src/index.ts` on startup.

#### T8: Auth (Minimal) ⬜
**Owner:** TBD | **Est:** 3-4 hours
**What:** Simple JWT auth. Login page. Don't need registration for demo (use seeded user).
**Can fake:** Skip auth entirely for demo. Just hardcode a demo user. Add "Login as Demo User" button.
**Files:** New `src/middleware/auth.ts`, `frontend/src/pages/Login.tsx`

#### T9: Live Negotiation Updates ⬜
**Owner:** TBD | **Est:** 3-4 hours
**What:** WebSocket or SSE from backend to frontend during active call. Show real-time transcript.
**Frontend:** `NegotiationLive.tsx` already has the UI, just needs real data source.
**Files:** Add WebSocket server to `src/index.ts`, update `NegotiationLive.tsx`

### 🟢 P2 - Nice to Have (Polish)

#### T10: Statement Scanner ⬜
**Owner:** TBD | **Est:** Already built
**What:** Test and polish `scanner.ts`. Upload a real statement, verify parsing.
**Files:** `src/services/scanner.ts`, `frontend/src/pages/ScanStatement.tsx`

#### T11: Landing Page Polish ⬜
**Owner:** TBD | **Est:** Ongoing
**What:** Continue iterating on `index.html`. Add demo video when ready.

#### T12: Pitch Deck / Demo Script ⬜
**Owner:** Abhishek + AI | **Est:** 1 day (closer to event)
**What:** 3-minute pitch. Problem > Solution > Demo > Market > Ask.

---

## Recommended Sprint Plan (Feb 19-27)

| Day | Date | Focus | Tasks |
|-----|------|-------|-------|
| 1 | Feb 19 (Wed) | Setup + Research | T2 (Telnyx creds), Research Telnyx Call Control + OpenAI Realtime patterns |
| 2 | Feb 20 (Thu) | Voice Agent | T1 start: Build OpenAI Realtime integration |
| 3 | Feb 21 (Fri) | Voice Agent | T1 finish: End-to-end call working |
| 4 | Feb 22 (Sat) | Deploy + Seed | T3, T4, T7: Deploy both services, seed demo data |
| 5 | Feb 23 (Sun) | Integration | T5: Wire full demo flow end-to-end |
| 6 | Feb 24 (Mon) | Polish | T6 (Neo4j), T8 (auth), T9 (live updates) |
| 7 | Feb 25 (Tue) | Polish | T10, T11, bug fixes |
| 8 | Feb 26 (Wed) | Demo prep | T12: Pitch deck, rehearse, final fixes |
| 9 | Feb 27 (Thu) | 🏆 HACKATHON DAY | Ship it. Win it. |

---

## Key Decisions Needed

1. **Voice approach:** Telnyx Call Control + OpenAI Realtime (complex but real) vs simplified TTS/STT flow (faster to build)?
2. **Neo4j:** Real instance or fake the leverage data for demo?
3. **Auth:** Real JWT or "Login as Demo User" button?
4. **Deploy target:** Render (free tier) or something else?

---

## How to Resume (Session Recovery)

If context is lost, read these files in order:
1. `TASKS.md` (this file) - current state of all tasks
2. `PRD.md` - full product requirements
3. `src/services/voice.ts` - the most critical piece to get right
4. `src/routes/api.ts` - all API endpoints
5. `src/types/index.ts` - data models

The repo is at `github.com/a692570/slash`. Clone to `/tmp/slash`.
Landing page is live at `https://a692570.github.io/slash/`.

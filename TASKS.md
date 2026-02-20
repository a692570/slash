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

#### T1: Voice Agent Rewrite ✅ DONE
**Owner:** Crabishek | **Est:** 1-2 days | **Blocked by:** Nothing (creds ready)
**What:** Rewrite `src/services/voice.ts` to use Telnyx AI Assistants.
**Note:** Rewrote voice.ts + assistant.ts to use real Telnyx AI Assistants. Fixed instruction passing on call.answered, added transcript/completion/error webhook handlers, fixed voice setting and variable bugs. Compiles clean.
**Approach:** 
1. Create a "Slash Bill Negotiator" assistant via `POST /v2/ai/assistants` with negotiation instructions, GPT-4o model, MiniMax voice, Deepgram transcription.
2. Outbound call: `POST /v2/calls` (Dial) to provider retention number.
3. On call answer: `POST /v2/calls/{call_control_id}/actions/ai_assistant_start` with assistant ID + dynamic instructions (bill details, competitor rates, tactics).
4. Webhooks: `call.conversation.ended` for results, `call.conversation_insights.generated` for transcript.
**Files:** `src/services/voice.ts` (rewrite), `src/services/assistant.ts` (new, manages Telnyx AI Assistant)
**Acceptance:** Can make a real outbound call to a test number, AI speaks the negotiation greeting, converses, and we get transcript back.
**Reference:** Existing assistant pattern from "Crabishek Voice Agent" (assistant-5bf76f01) on the account.

#### T2: Telnyx Account Setup ✅ DONE
**What:** API key, phone number (+14155491552), Call Control connection (2888193300928398948), Tavily key. All in `.env`.

#### T3: Deploy on Render ⬜
**Owner:** Crabishek | **Est:** 2-3 hours
**What:** Create `render.yaml`. Deploy Express backend + serve React frontend from Express. Single service.
**Requirements:**
- Public URL for Telnyx webhooks (call.conversation.ended, call.answered, etc.)
- Environment variables configured on Render dashboard
- Health check at `/health` (already exists)
- Serve frontend: `app.use(express.static('frontend/dist'))` in src/index.ts
**Files:** New `render.yaml`, update `src/index.ts`, update `package.json` build scripts
**Why Render:** 2 judges from Render. Free points.

#### T5: Demo Flow (End-to-End) ⬜
**Owner:** TBD | **Est:** 1 day
**What:** Wire the full happy path: Add bill > Research runs > Strategy built > Call initiated > Live updates > Result shown.
**This is the money shot for demo day.** Everything else supports this flow.

### 🟡 P1 - Should Have (Makes Demo Impressive)

#### T6: Neo4j Setup ⬜
**Owner:** Crabishek | **Est:** 2-3 hours
**What:** Provision Neo4j Aura Free instance. Seed with provider data. Connect `graph.ts`.
**Output:** Working knowledge graph that gets smarter with each negotiation.
**MUST DO:** Neo4j is a sponsor. Real instance required, no faking.

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

#### T13: Modulate Velma Integration ⬜
**Owner:** Crabishek + Abhishek | **Est:** 3-4 hours (at event)
**What:** Integrate Modulate's Velma voice intelligence to monitor negotiation calls.
**Approach:** 
- Research Velma API before event (preview.modulate.ai)
- At event: get API access from Modulate team (Carter/Graham are judges, will be on-site)
- Pipe call audio or use webhook integration for real-time voice monitoring
- Show monitoring dashboard: emotion detection, escalation alerts, call quality score
**Why:** 2 judges from Modulate (CTO + COO). This is the highest-value integration.
**Prep before event:** Stub out the integration code so we just plug in API keys on-site.

#### T12: Pitch Deck / Demo Script ⬜
**Owner:** Abhishek + AI | **Est:** 1 day (closer to event)
**What:** 3-minute pitch. Problem > Solution > Demo > Market > Ask.

---

## Key Decisions (Made)

1. **Voice approach:** Telnyx AI Assistants. Dial via Call Control, then `ai_assistant_start`. Telnyx handles GPT-4o, MiniMax TTS, Deepgram STT. No OpenAI key needed (swap at event if they provide one).
2. **Neo4j:** Spin up Aura Free. It's a sponsor, so must be real.
3. **Auth:** Skip. "Login as Demo User" button. Judges don't care.
4. **Deploy target:** Render. Two Render judges. Non-negotiable.
5. **Modulate integration:** Pipe call audio through Velma for voice safety monitoring. Two Modulate judges (CTO + COO). Highest priority sponsor integration.

## Sponsor Integration Checklist

| Sponsor | Integration | Status | Priority |
|---------|------------|--------|----------|
| Tavily | Competitor research API | ✅ Code exists, API key configured | Done |
| Neo4j | Knowledge graph for provider data | 🔲 Code exists, need Aura Free instance | HIGH (sponsor) |
| Render | Deployment platform | 🔲 Need render.yaml | HIGH (2 judges) |
| Modulate | Velma voice monitoring on calls | 🔲 Research API, integrate at event | HIGH (2 judges) |
| OpenAI | GPT-4o via Telnyx AI Assistants | ✅ Indirect (Telnyx handles it) | Done |
| AWS | Could use for call recordings (S3) | 🔲 Stretch goal | LOW |
| Yutori | Pitch framing (autonomous agent) | N/A - narrative only | MED (1 judge) |
| Senso | Pitch framing (knowledge for CX) | N/A - narrative only | LOW |
| Numeric | Pitch framing (financial data) | N/A - narrative only | LOW |

## Hackathon Day Schedule (Feb 27)

- 9:30 AM: Doors open
- 9:45 AM: Keynote
- 11:00 AM: START CODING (5.5 hrs only!)
- 1:30 PM: Lunch
- 4:30 PM: SUBMISSION DEADLINE
- 5:00 PM: Finalists present
- 7:00 PM: Awards

**⚠️ Only 5.5 hours at event. Everything must work BEFORE we walk in. Event time = Modulate integration + polish + demo prep.**

## Sprint Plan (Feb 19-27)

| Day | Date | Focus | Tasks |
|-----|------|-------|-------|
| 1 | Feb 19 (Wed) | Setup | ✅ Telnyx creds, Tavily key, hackathon research |
| 2 | Feb 20 (Thu) | Voice Agent | T1: Rewrite voice.ts for Telnyx AI Assistants (Dial + ai_assistant_start). Create Slash negotiator assistant. |
| 3 | Feb 21 (Fri) | Voice Agent + Render | T1 finish + T3: End-to-end call working. Create render.yaml, deploy. |
| 4 | Feb 22 (Sat) | Neo4j + Seed | T6 + T7: Spin up Neo4j Aura Free, seed provider data, seed demo bills. |
| 5 | Feb 23 (Sun) | Full Integration | T5: Wire full demo flow. Add bill > Tavily research > Strategy > Call > Result. |
| 6 | Feb 24 (Mon) | Frontend + Live Updates | T9: WebSocket/SSE for live call transcript. Polish dashboard. |
| 7 | Feb 25 (Tue) | Modulate Research | Research Velma API. Prep integration code (finish at event). Bug fixes. |
| 8 | Feb 26 (Wed) | Demo Prep | T12: Pitch deck (3 min). Rehearse. Name-drop every sponsor. Final fixes. |
| 9 | Feb 27 (Thu) | 🏆 HACKATHON | Modulate integration on-site. Polish. Demo. Win $47k. |

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

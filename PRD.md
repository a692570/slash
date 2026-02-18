# Slash - AI Bill Negotiation Agent

## Product Requirements Document (PRD)

**Version:** 1.0  
**Hackathon:** Autonomous Agents Hackathon SF, Feb 27, 2026  
**Status:** MVP Planning  
**Focus:** Internet/Cable Vertical

---

## 1. Problem Statement

### The Pain
- **Americans overpay on recurring bills** — average household spends $400+/month on telecom alone
- **Sitting on hold for 30-60 minutes to negotiate is painful** — most people give up
- **Existing services take 40% of savings** — Trim, Billshark, and similar take a massive cut
- **No leverage** — individual customers have no bargaining power vs. billion-dollar providers

### Market Size
- US telecom market: ~$500B/year
- Average savings potential per household: $30-80/month
- Adoption barrier: time + hassle + 40% fee

---

## 2. Solution

### Value Proposition
**Slash** is an AI agent that:
1. **Researches** competitor pricing to build leverage
2. **Calls** your provider (via Telnyx Voice AI)
3. **Negotiates** on your behalf using proven tactics
4. **Takes only 10%** of savings (vs 40% for competitors)

### Key Differentiators
| Feature | Slash | Trim | Billshark |
|---------|-------|------|-----------|
| Fee | 10% | 25-40% | 40% |
| AI Voice Calls | ✅ | ❌ | ❌ |
| Competitor Research | ✅ | Limited | Limited |
| Knowledge Graph | ✅ | ❌ | ❌ |
| Vertical Focus | Internet 1st | Broad | Broad |

---

## 3. User Flow

### Step-by-Step Journey

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Sign Up   │────▶│ Add Bills   │────▶│ Confirm     │
│   (30s)     │     │ (2 min)     │     │ Auth        │
└─────────────┘     └─────────────┘     └─────────────┘
                                               │
                                               ▼
                                        ┌─────────────┐
                    ┌───────────────────│   Research  │
                    │                   │  (Automated)│
                    │                   └─────────────┘
                    │                         │
                    ▼                         ▼
              ┌─────────────┐          ┌─────────────┐
              │   Call      │◀─────────│  Strategy   │
              │ In Progress │          │   Engine    │
              └─────────────┘          └─────────────┘
                    │
                    ▼
              ┌─────────────┐          ┌─────────────┐
              │   Success   │─────────▶│  Dashboard  │
              │ (New Rate!) │          │   Updated   │
              └─────────────┘          └─────────────┘
```

### Detailed Steps

1. **Sign Up** (30 seconds)
   - Email + password
   - Phone number for auth
   - Select bill categories (Internet first)

2. **Add Bills** (2 minutes)
   - Provider name (dropdown: Comcast, Spectrum, AT&T, etc.)
   - Current plan/rate
   - Account number (for verification)
   - Optional: screenshot of bill

3. **Confirm Authorization**
   - One-click approval for Slash to call on your behalf
   - Verbal consent script provided

4. **Research Phase** (automated, background)
   - Tavily scrapes competitor rates
   - Neo4j stores leverage data
   - Strategy engine builds negotiation plan

5. **Negotiation Call** (3-8 minutes)
   - Telnyx initiates outbound call
   - AI agent negotiates with retention rep
   - Real-time status via webhook

6. **Success & Savings**
   - New rate confirmed
   - User approves final offer
   - 10% fee applied to monthly savings
   - Dashboard updated

---

## 4. MVP Scope (10-Day Hackathon)

### What We're Building

| Feature | Priority | Days |
|---------|----------|------|
| Web Dashboard (React) | P0 | 2 |
| User Auth + Bill CRUD | P0 | 2 |
| Competitor Research (Tavily) | P0 | 2 |
| Voice Agent (Telnyx + OpenAI) | P0 | 3 |
| Knowledge Graph (Neo4j) | P1 | 2 |
| Strategy Engine | P1 | 2 |
| Deployment (Render) | P1 | 1 |

### Out of Scope (v1)
- Mobile apps (web only)
- Multiple verticals (Internet only)
- Real payment processing (manual invoicing)
- SMS notifications (email only)
- Live chat support
- Enterprise features

### Vertical Focus
**Internet/Cable** — Why:
- Highest call volume for retention departments
- Competitor pricing readily available
- Strong retention incentives (churn costs providers $300-500)
- Clear success metrics

---

## 5. Architecture

### System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                        │
│                    dash.slash.ai (Render)                       │
└──────────────────────────────┬──────────────────────────────────┘
                               │ HTTPS
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND (Express/TS)                       │
│                   api.slash.ai (Render)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Auth Module │  │  Bill Module │  │  Call Module │          │
│  │  (JWT)       │  │  (CRUD)      │  │  (Webhooks)  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└──────────────────────────────┬──────────────────────────────────┘
                               │
         ┌─────────────────────┼─────────────────────┐
         ▼                     ▼                     ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   Neo4j         │  │    Tavily       │  │    Telnyx       │
│  (Knowledge    │  │  (Competitor    │  │  (Voice AI)     │
│   Graph)       │  │   Research)     │  │  (Outbound      │
│                 │  │                 │  │   Calls)        │
└─────────────────┘  └─────────────────┘  └─────────────────┘
         │                                       │
         ▼                                       ▼
┌─────────────────┐                    ┌─────────────────┐
│  OpenAI (GPT-4)│                    │  Provider       │
│  (Strategy +   │                    │  Retention      │
│   Negotiation) │                    │  Departments    │
└─────────────────┘                    └─────────────────┘
```

### Service Boundaries

| Service | Responsibility | Tech |
|---------|---------------|------|
| Frontend | Dashboard, bill management | React, Tailwind |
| Backend | Auth, business logic, API | Express, TypeScript |
| Database | User data, bills | PostgreSQL (Render) |
| Knowledge Graph | Leverage data, history | Neo4j Aura |
| Research | Competitor intel | Tavily API |
| Voice | Call orchestration | Telnyx Call Control |
| AI | Strategy, negotiation | OpenAI GPT-4 |

### Data Flow

1. **Bill Added** → Backend stores in PostgreSQL → Triggers research job
2. **Research Complete** → Tavily results → Neo4j (leverage node)
3. **Call Initiated** → Telnyx outbound → OpenAI realtime
4. **Negotiation Active** → Real-time webhook updates → Dashboard
5. **Call Complete** → Final offer stored → Success notification

---

## 6. API Design

### Core Endpoints

#### Auth
```
POST   /api/auth/register     # Create account
POST   /api/auth/login        # Get JWT
GET    /api/auth/me           # Current user
```

#### Bills
```
GET    /api/bills             # List user's bills
POST   /api/bills             # Add new bill
GET    /api/bills/:id         # Get bill details
PUT    /api/bills/:id         # Update bill
DELETE /api/bills/:id         # Remove bill
POST   /api/bills/:id/negotiate  # Start negotiation
```

#### Negotiations
```
GET    /api/negotiations      # List negotiations
GET    /api/negotiations/:id  # Get negotiation status
POST   /api/negotiations/webhook   # Telnyx webhook (internal)
```

#### Users
```
GET    /api/users/savings     # Total savings summary
GET    /api/users/stats       # Dashboard stats
```

### Request/Response Examples

#### Add Bill
```json
POST /api/bills
{
  "provider": "comcast",
  "accountNumber": "123456789",
  "currentRate": 89.99,
  "planName": "Xfinity Performance",
  "billDate": "2026-02-01"
}

Response: 201 Created
{
  "id": "bill_abc123",
  "provider": "comcast",
  "currentRate": 89.99,
  "status": "active",
  "createdAt": "2026-02-17T18:00:00Z"
}
```

#### Start Negotiation
```json
POST /api/bills/bill_abc123/negotiate

Response: 202 Accepted
{
  "negotiationId": "neg_xyz789",
  "status": "researching",
  "estimatedDuration": "5-10 minutes"
}
```

---

## 7. Negotiation Strategy Engine

### How It Works

The strategy engine builds a negotiation plan by:
1. **Analyzing leverage** from Neo4j (competitor rates, retention offers)
2. **Selecting tactics** based on provider, tenure, and plan type
3. **Executing escalation** if first attempt fails

### Leverage Data (Neo4j Schema)

```typescript
// Node types
Provider {
  id: string
  name: string
  retentionDepartments: string[]
}

CompetitorOffer {
  provider: string
  planType: string
  monthlyRate: number
  contractTerms: string
}

RetentionOffer {
  provider: string
  trigger: string  // "threaten_churn", "30_days_left", etc.
  typicalDiscount: number
  successRate: number
}

NegotiationHistory {
  provider: string
  tactic: string
  successRate: number
  avgSavings: number
}
```

### Core Tactics

| Tactic | When Used | Script Summary |
|--------|-----------|----------------|
| **Competitor Conquest** | Competitor has lower rate | "I see X is offering Y for $Z" |
| **Loyalty Play** | Customer >2 years | "I've been loyal for X years..." |
| **Churn Threat** | High competitor offer | "I'm considering switching to..." |
| **Retention Close** | Rep offers discount | "Can you do one better?" |
| **Supervisor Request** | Rep stalls | "I'd like to speak with your supervisor" |

### Escalation Path

```
Tactic 1: Competitor Offer
    │ (No movement)
    ▼
Tactic 2: Loyalty + Churn Threat
    │ (Rep checks system)
    ▼
Tactic 3: Supervisor Request
    │ (Supervisor has authority)
    ▼
Tactic 4: Final Offer Accept
    └─► Success OR No Deal (log & notify user)
```

### System Prompts (OpenAI)

**Negotiation Persona:**
> You are a professional bill negotiator representing a customer. Your goal is to reduce their monthly bill. You are polite but persistent. You know the provider's retention policies. You never lie but you use negotiation tactics. You escalate appropriately. You aim for at least 20% savings.

---

## 8. Screen Inventory

### MVP Screen List

| # | Screen | Purpose | Key Elements |
|---|--------|---------|--------------|
| 1 | **Landing** | Convert visitors | Hero, value prop, CTA |
| 2 | **Sign Up** | Registration | Email, password, phone |
| 3 | **Login** | Authentication | Email, password |
| 4 | **Dashboard** | Overview | Savings total, active bills, status cards |
| 5 | **Add Bill** | Bill entry | Provider dropdown, account #, rate input |
| 6 | **Bill List** | Manage bills | Cards with status, actions |
| 7 | **Bill Detail** | Single bill view | Full details, negotiation history |
| 8 | **Negotiation In Progress** | Real-time status | Live call status, timer, progress |
| 9 | **Negotiation Complete** | Result | Success/fail, offer details, accept/decline |
| 10 | **Profile/Settings** | User management | Account, billing history |

### Wireframe Notes

**Dashboard (Screen 4)**
- Top: Total savings this month, all-time savings
- Main: Active negotiations (if any) with progress
- List: Your bills with status badges
- Bottom: "Add New Bill" CTA

**Bill Detail (Screen 7)**
- Header: Provider logo, plan name
- Current rate, potential savings
- History: Previous negotiations with outcomes
- Actions: "Negotiate Now" button (if not active)

**Negotiation In Progress (Screen 8)**
- Center: Animated phone/agent graphic
- Status text: "Researching competitor rates..." → "Connecting to provider..." → "Negotiating..."
- Estimated time remaining
- "Cancel" button (cancels call)

---

## 9. Tech Decisions

### Why This Stack

| Tool | Choice | Alternatives | Why |
|------|--------|--------------|-----|
| **Voice/Telephony** | Telnyx | Twilio, Vapi | Better AI integration + pricing |
| **Research** | Tavily | Custom scraper | Fast, reliable, no blocking |
| **Knowledge Graph** | Neo4j | PostgreSQL | Relationship queries for leverage |
| **AI/Strategy** | OpenAI | Anthropic, local | Ecosystem, realtime voice support |
| **Hosting** | Render | Vercel, Railway | Cheapest PostgreSQL + easy deploy |
| **Frontend** | React | Vue, Svelte | Team familiarity |
| **Backend** | Express | Fastify, Hono | TypeScript support, maturity |

### Cost Estimates (Monthly)

| Service | Free Tier | Paid (MVP) |
|---------|-----------|------------|
| Telnyx | $0 | ~$50 (50 calls) |
| Tavily | 1000 searches | $15 (10k searches) |
| Neo4j Aura | Free | $0 (Aura Free) |
| OpenAI | $0 | ~$30 (500 negotiation calls) |
| Render | Free | $0 (free tier) |
| **Total** | | **~$95/mo** |

---

## 10. Post-Hackathon Roadmap

### Q1 2026 (Post-Launch)

| Week | Feature | Impact |
|------|---------|--------|
| 1 | Phone verification | Trust + security |
| 2 | Email notifications | Reduce dashboard dependency |
| 3 | Mobile web优化 | Better mobile UX |
| 4 | Analytics dashboard | User engagement insights |

### Q2 2026 (Expansion)

| Month | Vertical | Notes |
|-------|----------|-------|
| April | TV/Streaming | Netflix, Hulu, cable TV |
| May | Wireless | AT&T, Verizon, T-Mobile |
| June | Insurance | Bundles with telecom |

### V2 Features

- [ ] Real payment processing (Stripe)
- [ ] SMS notifications
- [ ] Multi-language support
- [ ] iOS/Android native apps
- [ ] Browser extension
- [ ] API for partners (real estate, fintech)
- [ ] Enterprise B2B (employer-sponsored)

### Growth Targets

| Metric | Month 1 | Month 3 | Month 6 |
|--------|---------|---------|---------|
| Users | 100 | 1,000 | 10,000 |
| Negotiations | 50 | 500 | 5,000 |
| Revenue | $500 | $10K | $100K |

---

## Appendix

### Provider List (v1)

- Comcast (Xfinity)
- Spectrum
- AT&T Internet
- Verizon Fios
- Cox
- Optimum

### Success Metrics

- **Negotiation success rate**: >70%
- **Average savings**: >$20/month
- **Call completion**: >80%
- **User satisfaction**: >4.5/5

### Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Providers block AI calls | Rotate numbers, human-like pacing |
| OpenAI rate limits | Queue system, cache strategies |
| Neo4j costs | Use Aura Free, optimize queries |
| Legal (TCPA) | User consent, compliance docs |
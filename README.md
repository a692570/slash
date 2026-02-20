# Slash 🔪

**AI agent that calls your providers and negotiates your bills down. You do nothing. It takes 10%.**

Americans overpay $50B+ annually on recurring bills. Slash researches competitor pricing, calls your providers over real phone lines, and negotiates better rates — while you sleep.

> 🏆 Built for the **Autonomous Agents Hackathon SF** — Feb 27, 2026 — $47k+ in prizes

---

## How It Works

1. **Add your bills** — internet, phone, insurance, subscriptions
2. **Slash researches** — finds competitor offers, builds your leverage profile
3. **Slash calls** — dials your provider's retention line and negotiates live
4. **You save** — average $240/year per bill. We take 10% of savings.

---

## Architecture

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   User UI   │────▶│   Slash Server   │────▶│  Telnyx Voice   │
│  (Render)   │     │   (Node.js)      │     │  AI Assistants  │
└─────────────┘     └──────┬───────────┘     └────────┬────────┘
                           │                          │
                    ┌──────┴───────┐           ┌──────┴────────┐
                    │              │           │               │
              ┌─────▼─────┐ ┌─────▼─────┐  ┌──▼───┐   ┌──────▼──────┐
              │  Tavily    │ │  Yutori   │  │ PSTN │   │  Modulate   │
              │  Research  │ │  Browse   │  │ Call │   │  Velma      │
              └─────┬──────┘ └───────────┘  └──────┘   └─────────────┘
                    │                                         
              ┌─────▼─────┐  ┌───────────┐  ┌──────────────┐
              │   Neo4j   │  │    AWS    │  │   Senso     │
              │   Graph   │  │  S3/logs  │  │  Playbooks  │
              └───────────┘  └───────────┘  └──────────────┘
```

---

## Sponsor Integration Strategy

We integrate **9+ sponsor APIs/products** to maximize prize track eligibility:

| # | Sponsor/Tech | Integration | Notes |
|---|---|---|---|
| 1 | **Telnyx** | Call Control + AI Assistants for real outbound negotiation calls | Core voice infrastructure |
| 2 | **AWS** | Call recordings stored in S3, Bedrock for analysis | Cloud infra |
| 3 | **OpenAI** | GPT-4o powers the negotiation AI brain (via Telnyx AI Assistants) | Core AI |
| 4 | **Render** | Production deployment platform | 2 judges from Render |
| 5 | **Tavily** | Competitor pricing research API — real-time market data | Already integrated |
| 6 | **Yutori** | Browsing API for deep web research on provider sites, account verification, bill scraping | 1 judge (chief scientist) |
| 7 | **Neo4j** | Knowledge graph storing provider data, negotiation outcomes, competitor rates | Graph DB |
| 8 | **Modulate** | Velma voice intelligence monitors calls for quality, safety, emotion detection | 2 judges (CTO + COO) |
| 9 | **Senso** | Knowledge management for negotiation playbooks and best practices | KM angle |
| 10 | **Numeric** | Financial data analysis and bill tracking | Finance angle |

---

## Tech Stack

- **Runtime:** Node.js + TypeScript
- **Voice:** Telnyx Call Control + AI Assistants (GPT-4o)
- **Research:** Tavily API + Yutori Browsing API
- **Database:** Neo4j (knowledge graph), AWS S3 (recordings)
- **AI:** OpenAI GPT-4o (via Telnyx), AWS Bedrock
- **Voice Intelligence:** Modulate Velma
- **Knowledge Base:** Senso
- **Deployment:** Render
- **Agent Framework:** OpenClaw (optional skill mode)

---

## Quick Start

```bash
npm install
cp .env.example .env  # add your API keys
npm run dev            # dashboard at localhost:3100
```

### Required API Keys

```
TELNYX_API_KEY=
OPENAI_API_KEY=
TAVILY_API_KEY=
NEO4J_URI=
NEO4J_PASSWORD=
YUTORI_API_KEY=
MODULATE_API_KEY=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
```

---

## OpenClaw Skill Mode

```bash
openclaw skill install slash
# Slash runs autonomously — weekly bill checks, auto-negotiation, memory logging
```

---

## Team

Built by Abhishek at the **Autonomous Agents Hackathon SF** — Feb 27, 2026

*Slash saves you money so you don't have to sit on hold.*

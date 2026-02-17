# Slash 🔪

**AI agent that negotiates your bills down.**

Americans overpay $50B+ annually on recurring bills. Slash researches competitor pricing, calls your providers over real phone lines, and negotiates better rates — while you sleep.

## How It Works

1. **Add your bills** — internet, phone, insurance, subscriptions
2. **Slash researches** — finds competitor offers, builds your leverage profile
3. **Slash calls** — dials your provider's retention line and negotiates
4. **You save** — average $240/year per bill

## Stack

- **[Telnyx](https://telnyx.com)** — Voice AI for real phone calls (both sides)
- **[Tavily](https://tavily.com)** — Real-time competitor price research
- **[Neo4j](https://neo4j.com)** — Knowledge graph for account history & leverage
- **[OpenAI](https://openai.com)** — Negotiation strategy & conversation intelligence
- **[Render](https://render.com)** — Deployment
- **[OpenClaw](https://openclaw.ai)** — Agent framework (optional: install as skill for autonomous mode)

## Quick Start

```bash
npm install
cp .env.example .env  # add your API keys
npm run dev            # dashboard at localhost:3100
```

## OpenClaw Skill Mode

```bash
openclaw skill install slash
# Slash now runs autonomously — weekly bill checks, auto-negotiation, memory logging
```

## Built at Autonomous Agents Hackathon SF — Feb 27, 2026

---

*Slash saves you money so you don't have to sit on hold.*

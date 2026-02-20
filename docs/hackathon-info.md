# Autonomous Agents Hackathon SF

**Date:** February 27, 2026
**Event:** https://luma.com/sfagents?tk=Zi7oGC

---

## Judges

| Name | Role | Company | LinkedIn |
|------|------|---------|----------|
| Carter Huffman | CTO, Co-Founder | Modulate | [Profile](https://www.linkedin.com/in/carter-huffman-a9aba05b/) |
| Graham Gullans | COO | Modulate AI | [Profile](https://www.linkedin.com/in/grahamgullans/) |
| Dhruv Batra | Co-founder, Chief Scientist | Yutori | [Profile](https://www.linkedin.com/in/dhruv-batra-dbatra/) |
| Anushk Mittal | Co-founder & CEO | Shapes inc | [Profile](https://www.linkedin.com/in/anushkmittal/) |
| Vladimir de Turckheim | Core Maintainer | Node.js | [Profile](https://www.linkedin.com/in/vladimirdeturckheim/) |
| Ojus Save | Developer Relations | Render | [Profile](https://www.linkedin.com/in/ojus/) |
| Shiffra Williams | DevRel | Render | [Profile](https://www.linkedin.com/in/shifra-williams/) |
| Marcelo Chaman Mallqui | Founding Design Engineer | Gumloop | [Profile](https://www.linkedin.com/in/marc-cham/) |

## Sponsors (derived from judges)

| Sponsor | What They Do | Track Angle for Slash |
|---------|-------------|----------------------|
| **Modulate** | Voice AI safety, ToxMod (voice moderation). Real-time voice analysis. | Use Modulate's voice tech for call quality/safety monitoring during negotiations. Their CTO + COO are both judging, so this is HIGH priority. |
| **Yutori** | AI agents / conversational AI platform | Position Slash as an autonomous agent that acts on your behalf. Aligns with their vision. |
| **Shapes inc** | AI character/persona platform | The negotiator persona angle. Our AI has a distinct negotiation personality. |
| **Render** | Cloud deployment platform | **Deploy on Render.** Two Render judges. This is free points. |
| **Gumloop** | AI workflow automation / no-code | Show how Slash pipelines (research > strategy > call) are composable workflows. |
| **Node.js** | JavaScript runtime | We're already built on Node/Express/TypeScript. Vladimir will appreciate clean Node architecture. |

## Strategy: Maximize Prize Eligibility

### Must Do (Judge Alignment)
1. **Deploy on Render** - 2 judges from Render. Use render.yaml. Mention it in pitch.
2. **Integrate Modulate** - 2 judges from Modulate (CTO + COO). Their product is voice safety/moderation. Even a light integration (voice analysis on calls) scores huge points.
3. **Node.js best practices** - Core maintainer judging. Clean TypeScript, proper error handling, modern Node patterns.

### Should Do
4. **Yutori angle** - Frame pitch around autonomous agents (their thesis). Slash acts independently on user's behalf.
5. **Shapes angle** - Negotiator persona design. The AI has a defined character: polite, persistent, data-armed.

### Research Needed
- [ ] Modulate has "Velma" - voice intelligence platform. Has a preview at preview.modulate.ai. Their AI Guardrails product monitors AI voice agents in real-time, detects when conversations go off-rails, and flags escalation. PERFECT fit: we use Velma to monitor our negotiation calls for quality + safety. Their CTO + COO are judging. This is our #1 sponsor integration.
- [ ] Does Gumloop have an API we can use for workflow orchestration?
- [ ] Does Yutori have a public API or SDK?

---

## Revised Architecture (Sponsor-Optimized)

```
User → Slash Dashboard (React/Node.js)
  → Tavily (competitor research)
  → Strategy Engine (built-in)
  → Telnyx Call Control (outbound call)
    → Telnyx AI Assistant (negotiation conversation)
    → Modulate ToxMod? (voice safety monitoring)
  → Results Dashboard
  
Deployed on: RENDER ← important
Built with: Node.js/TypeScript ← important
```

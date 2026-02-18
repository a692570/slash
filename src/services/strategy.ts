// ===========================================
// STRATEGY SERVICE - Negotiation Strategy Engine
// ===========================================

import {
  Bill,
  NegotiationTactic,
  CompetitorRate,
  Negotiation,
} from '../types/index.js';
import { getLeverage } from './graph.js';

export interface NegotiationStrategy {
  tactics: NegotiationTactic[];
  primaryTactic: NegotiationTactic;
  fallbackTactic: NegotiationTactic;
  script: string;
  expectedSavings: number;
}

/**
 * Build a negotiation strategy based on bill, competitor data, and graph intelligence
 */
export async function buildStrategy(
  bill: Bill,
  competitorRates: CompetitorRate[]
): Promise<NegotiationStrategy> {
  // Get leverage data from Neo4j graph
  const leverage = await getLeverage(bill.provider);
  
  // Merge graph rates with research rates (prefer graph data - it's verified)
  let mergedRates = [...competitorRates];
  
  if (leverage && leverage.competitorOffers.length > 0) {
    // Merge, removing duplicates by provider, prefer graph data
    const existingProviders = new Set(mergedRates.map(r => r.provider));
    for (const offer of leverage.competitorOffers) {
      if (!existingProviders.has(offer.provider)) {
        mergedRates.push(offer);
      }
    }
    // Sort again
    mergedRates.sort((a, b) => a.monthlyRate - b.monthlyRate);
  }

  const tactics: NegotiationTactic[] = [];
  
  // Check if competitor has lower rate (use merged rates)
  const lowerRateCompetitors = mergedRates.filter(
    r => r.monthlyRate < bill.currentRate
  );
  const hasCompetitiveAdvantage = lowerRateCompetitors.length > 0;
  
  // Check graph for retention offer insights
  const hasRetentionData = leverage && leverage.retentionOffers.length > 0;
  const highSuccessRetention = leverage?.retentionOffers.some(o => o.successRate > 0.6);
  
  // Determine tactics based on leverage
  if (hasCompetitiveAdvantage) {
    // Lead with competitor conquest
    tactics.push('competitor_conquest');
  }
  
  // Add loyalty play if customer has been with provider (assume >12mo)
  // In a real app, we'd check user tenure
  tactics.push('loyalty_play');
  
  // Always have churn threat as fallback
  tactics.push('churn_threat');
  
  // If we have high-success retention offers, add retention close
  if (hasRetentionData || highSuccessRetention) {
    tactics.push('retention_close');
  }
  
  // Add supervisor request as final escalation
  tactics.push('supervisor_request');
  
  // Calculate expected savings using graph intelligence
  let expectedSavings = 0;
  if (hasCompetitiveAdvantage && lowerRateCompetitors[0]) {
    // Target a rate between current and competitor's best
    expectedSavings = Math.min(
      bill.currentRate - lowerRateCompetitors[0].monthlyRate,
      bill.currentRate * 0.25  // Cap at 25% savings
    );
  } else if (leverage && leverage.averageSavings > 0) {
    // Use historical average from graph
    expectedSavings = Math.min(leverage.averageSavings, bill.currentRate * 0.25);
  } else {
    // Default to 15% savings
    expectedSavings = bill.currentRate * 0.15;
  }

  return {
    tactics,
    primaryTactic: tactics[0],
    fallbackTactic: 'churn_threat',
    script: generateNegotiationScript(tactics, bill, mergedRates),
    expectedSavings: Math.max(expectedSavings, 5), // Minimum $5 savings
  };
}

/**
 * Generate the negotiation script based on selected tactics
 */
export function generateNegotiationScript(
  tactics: NegotiationTactic[],
  bill: Bill,
  competitorRates: CompetitorRate[]
): string {
  const lines: string[] = [];
  
  // Opening
  lines.push(`Hello, I'm calling about my account. My account number is ${bill.accountNumber}.`);
  lines.push(`I'm currently on the ${bill.planName || 'current plan'} at $${bill.currentRate} per month.`);
  
  // Primary tactic
  const primaryTactic = tactics[0];
  
  if (primaryTactic === 'competitor_conquest' && competitorRates.length > 0) {
    const bestCompetitor = competitorRates[0];
    lines.push(`I've been looking at other options and noticed that ${bestCompetitor.provider} is offering similar service for $${bestCompetitor.monthlyRate} per month.`);
    lines.push(`I'm a loyal customer and would prefer to stay, but the price difference is significant.`);
    lines.push(`Can you help me get a better rate?`);
  } else if (primaryTactic === 'loyalty_play') {
    lines.push(`I've been a customer for over a year now and I've always paid on time.`);
    lines.push(`I'm trying to reduce my monthly expenses and would appreciate any loyalty discount you can offer.`);
    lines.push(`Can you review my account and see what's available?`);
  }
  
  // Secondary tactics (fallbacks)
  if (tactics.includes('churn_threat')) {
    lines.push(`If I can't get a better rate, I may need to consider switching to another provider.`);
  }
  
  // Closing
  lines.push(`What can you do to help me save on my monthly bill?`);
  
  return lines.join(' ');
}

/**
 * Get the next line in the negotiation script based on tactic
 */
export function getTacticScript(
  tactic: NegotiationTactic,
  bill: Bill,
  competitorRates: CompetitorRate[]
): string {
  
  switch (tactic) {
    case 'competitor_conquest':
      const best = competitorRates[0];
      return best 
        ? `I see that ${best.provider} is offering $${best.monthlyRate}/month. Can you match or beat that?`
        : `I've seen better rates elsewhere. Can you help me get a better deal?`;
    
    case 'loyalty_play':
      return `I've been a loyal customer for over a year. I'd like to stay with you but need a better rate. What can you offer?`;
    
    case 'churn_threat':
      return `I'm seriously considering switching providers. Is there anything you can do to keep my business?`;
    
    case 'retention_close':
      const savings = bill.currentRate * 0.2;
      return `Thank you for that offer. Can you do one better? I'd like to see if we can get to $${bill.currentRate - savings}/month.`;
    
    case 'supervisor_request':
      return `I appreciate your help, but I'd like to speak with a supervisor who may have more authority to help me.`;
    
    default:
      return `What other options are available to reduce my bill?`;
  }
}

/**
 * Update negotiation with tactic results
 */
export function recordTacticAttempt(
  negotiation: Negotiation,
  tactic: NegotiationTactic,
  outcome: 'success' | 'failed' | 'escalated',
  notes?: string
): Negotiation {
  const attempt = {
    tactic,
    timestamp: new Date(),
    outcome,
    notes,
  };
  
  return {
    ...negotiation,
    attempts: [...negotiation.attempts, attempt],
    currentTacticIndex: (negotiation.currentTacticIndex || 0) + 1,
  };
}

/**
 * Determine if negotiation should continue or end
 */
export function shouldContinueNegotiation(negotiation: Negotiation): boolean {
  // Already succeeded or failed
  if (negotiation.status === 'success' || negotiation.status === 'failed') {
    return false;
  }
  
  // Check attempts - max 5 attempts
  if (negotiation.attempts.length >= 5) {
    return false;
  }
  
  // Check time - max 10 minutes
  if (negotiation.startedAt) {
    const elapsed = Date.now() - negotiation.startedAt.getTime();
    if (elapsed > 10 * 60 * 1000) {
      return false;
    }
  }
  
  return true;
}

/**
 * Calculate final savings from negotiation
 */
export function calculateSavings(
  originalRate: number,
  newRate: number
): {
  monthlySavings: number;
  yearlySavings: number;
  percentageSaved: number;
} {
  const monthlySavings = Math.max(0, originalRate - newRate);
  const yearlySavings = monthlySavings * 12;
  const percentageSaved = (monthlySavings / originalRate) * 100;
  
  return {
    monthlySavings,
    yearlySavings,
    percentageSaved,
  };
}
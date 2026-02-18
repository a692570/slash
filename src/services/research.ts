// ===========================================
// RESEARCH SERVICE - Competitor Research via Tavily
// ===========================================

import { CompetitorRate, ProviderId, PROVIDERS } from '../types/index.js';

// Tavily API response types
interface TavilySearchResult {
  title: string;
  url: string;
  content: string;
}

interface TavilySearchResponse {
  results: TavilySearchResult[];
}

/**
 * Search Tavily for competitor pricing
 */
async function searchTavily(query: string): Promise<TavilySearchResponse> {
  const apiKey = process.env.TAVILY_API_KEY;
  
  if (!apiKey) {
    throw new Error('TAVILY_API_KEY not configured');
  }

  const response = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      search_depth: 'advanced',
      max_results: 5,
      api_key: apiKey,
    }),
  });

  if (!response.ok) {
    throw new Error(`Tavily API error: ${response.status}`);
  }

  const data = await response.json() as TavilySearchResponse;
  return data;
}

/**
 * Parse competitor rate from search result
 */
function parseCompetitorRate(result: TavilySearchResult, providerId: ProviderId): CompetitorRate {
  const content = result.content.toLowerCase();
  
  // Extract price from content (look for $XX.XX pattern)
  const priceMatch = content.match(/\$?(\d{2,3}\.?\d{0,2})/);
  const monthlyRate = priceMatch ? parseFloat(priceMatch[1]) : 0;

  return {
    provider: providerId,
    planName: result.title,
    monthlyRate: Math.max(monthlyRate, 20), // Minimum $20 fallback
    contractTerms: extractContractTerms(content),
    source: result.url,
    scrapedAt: new Date(),
  };
}

/**
 * Extract contract terms from content
 */
function extractContractTerms(content: string): string | undefined {
  if (content.includes('contract') || content.includes('term')) {
    return 'Contract required';
  }
  if (content.includes('no contract') || content.includes('month-to-month')) {
    return 'Month-to-month';
  }
  return undefined;
}

/**
 * Research competitor rates for a given provider
 * @param provider - The current provider (e.g., 'comcast')
 * @param currentRate - The customer's current monthly rate
 * @returns Array of CompetitorRate objects
 */
export async function researchCompetitorRates(
  provider: ProviderId,
  currentRate: number
): Promise<CompetitorRate[]> {
  const providerInfo = PROVIDERS[provider as ProviderId];
  
  if (!providerInfo) {
    throw new Error(`Unknown provider: ${provider}`);
  }

  const competitors = Object.values(PROVIDERS)
    .filter(p => p.id !== provider)
    .map(p => p.displayName);

  // Build search query
  const query = `${providerInfo.displayName} internet plans ${currentRate} compare ${competitors.join(' ')} 2026`;

  try {
    const results = await searchTavily(query);
    
    const allProviders: Record<string, ProviderId> = {
      'comcast': 'comcast', 'xfinity': 'comcast',
      'spectrum': 'spectrum',
      'at&t': 'att', 'att': 'att',
      'verizon': 'verizon', 'fios': 'verizon',
      'cox': 'cox',
      'optimum': 'optimum',
    };
    
    const competitorRates: CompetitorRate[] = results.results
      .map(result => {
        // Try to identify which provider this result is about
        const titleLower = result.title.toLowerCase();
        const contentLower = result.content.toLowerCase();
        const text = `${titleLower} ${contentLower}`;
        
        for (const [name, id] of Object.entries(allProviders)) {
          if (text.includes(name) && id !== provider) {
            return parseCompetitorRate(result, id);
          }
        }
        
        // Default to other provider if can't identify
        return null;
      })
      .filter((rate): rate is CompetitorRate => rate !== null && rate.monthlyRate > 0);

    // Sort by rate (lowest first)
    competitorRates.sort((a, b) => a.monthlyRate - b.monthlyRate);

    return competitorRates;
  } catch (error) {
    console.error('Research error:', error);
    // Return empty array on error - will use fallback strategy
    return [];
  }
}

/**
 * Get competitive analysis for a provider
 */
export async function getCompetitiveAnalysis(
  provider: ProviderId,
  currentRate: number
): Promise<{
  competitors: CompetitorRate[];
  leverage: number;
  recommendation: string;
}> {
  const competitorRates = await researchCompetitorRates(provider, currentRate);
  
  const lowerRateCompetitors = competitorRates.filter(r => r.monthlyRate < currentRate);
  const leverage = lowerRateCompetitors.length > 0 
    ? Math.min(lowerRateCompetitors.length / 3, 1)  // 0-1 scale
    : 0;

  let recommendation = '';
  if (leverage > 0.7) {
    recommendation = 'Strong leverage - lead with competitor conquest';
  } else if (leverage > 0.3) {
    recommendation = 'Moderate leverage - combine competitor + loyalty tactics';
  } else {
    recommendation = 'Limited leverage - lead with loyalty and churn threat';
  }

  return {
    competitors: competitorRates,
    leverage,
    recommendation,
  };
}
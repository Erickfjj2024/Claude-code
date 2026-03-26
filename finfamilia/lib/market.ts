// Market data fetching utilities
// Full implementation in Phase 10

export interface MarketData {
  selic: number;
  cdi: number;
  ipca: number;
  usd: number;
  ibovespa: number;
  ibovespaVariation: number;
  btc: number;
  btcVariation: number;
  eth: number;
  ethVariation: number;
}

export async function fetchMarketData(): Promise<MarketData | null> {
  // Placeholder — real implementation in Phase 10
  return null;
}

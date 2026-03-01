// Kalshi REST API v2 types
// Base URL: https://api.elections.kalshi.com/trade-api/v2

export interface KalshiCredentials {
  apiKey: string;
  privateKeyPem: string;
}

// ─── Events & Markets ────────────────────────────────────────────────────────

export interface KalshiEvent {
  event_ticker: string;
  series_ticker: string;
  sub_title: string;
  title: string;
  mutually_exclusive: boolean;
  category: string;
  markets?: KalshiMarket[];
}

export interface KalshiMarket {
  ticker: string;
  event_ticker: string;
  market_type: string;
  title: string;
  subtitle: string;
  open_time: string;
  close_time: string;
  expiration_time: string;
  status: string; // "active" | "closed" | "settled"
  yes_bid: number; // cents
  yes_ask: number; // cents
  no_bid: number; // cents
  no_ask: number; // cents
  last_price: number; // cents
  previous_yes_bid: number;
  previous_yes_ask: number;
  previous_price: number;
  volume: number;
  volume_24h: number;
  liquidity: number;
  open_interest: number;
  notional_value: number;
  result?: string; // "yes" | "no" | "" when settled
  can_close_early: boolean;
  expiration_value?: string;
  category: string;
  risk_limit_cents: number;
  rules_primary: string;
  rules_secondary?: string;
}

export interface KalshiOrderbook {
  ticker: string;
  yes: Array<[number, number]>; // [price, quantity]
  no: Array<[number, number]>; // [price, quantity]
}

export interface KalshiTrade {
  trade_id: string;
  ticker: string;
  count: number;
  yes_price: number; // cents
  no_price: number; // cents
  taker_side: "yes" | "no";
  created_time: string;
}

// ─── Portfolio ────────────────────────────────────────────────────────────────

export interface KalshiBalance {
  balance: number; // cents
  payout: number; // cents
}

export interface KalshiPosition {
  ticker: string;
  event_ticker: string;
  market_exposure: number; // cents
  position: number; // signed: positive = net yes, negative = net no
  resting_orders_count: number;
  realized_pnl: number; // cents
  total_traded: number; // cents
  fees_paid: number; // cents
}

export interface KalshiOrder {
  order_id: string;
  user_id: string;
  ticker: string;
  client_order_id: string;
  status: "resting" | "executed" | "canceled" | "pending";
  side: "yes" | "no";
  action: "buy" | "sell";
  type: "limit" | "market";
  no_price: number; // cents
  yes_price: number; // cents
  count: number;
  filled_count: number;
  remaining_count: number;
  amend_count?: number;
  amend_taker_fill_count?: number;
  decrease_count?: number;
  fcc_cancel_count?: number;
  close_cancel_count?: number;
  place_count: number;
  queue_position: number;
  created_time: string;
  last_update_time: string;
  expiration_time?: string;
  taker_fill_cost: number;
  maker_fill_cost: number;
  taker_fill_count: number;
  maker_fill_count: number;
  taker_fees: number;
  maker_fees: number;
}

export interface KalshiFill {
  fill_id: string;
  ticker: string;
  order_id: string;
  side: "yes" | "no";
  action: "buy" | "sell";
  type: "taker" | "maker";
  yes_price: number; // cents
  no_price: number; // cents
  count: number;
  is_taker: boolean;
  trade_id: string;
  created_time: string;
}

// ─── Request / Response wrappers ──────────────────────────────────────────────

export interface GetEventsParams {
  limit?: number;
  cursor?: string;
  status?: "open" | "closed" | "settled";
  series_ticker?: string;
  with_nested_markets?: boolean;
}

export interface GetMarketsParams {
  limit?: number;
  cursor?: string;
  event_ticker?: string;
  series_ticker?: string;
  max_close_ts?: number;
  min_close_ts?: number;
  status?: string;
  tickers?: string;
}

export interface GetTradesParams {
  ticker?: string;
  limit?: number;
  cursor?: string;
  min_ts?: number;
  max_ts?: number;
}

export interface GetOrdersParams {
  ticker?: string;
  event_ticker?: string;
  status?: "resting" | "canceled" | "executed";
  limit?: number;
  cursor?: string;
  min_ts?: number;
  max_ts?: number;
}

export interface GetPositionsParams {
  limit?: number;
  cursor?: string;
  count_filter?: "position" | "total_traded";
  settlement_status?: "all" | "settled" | "unsettled";
  ticker?: string;
  event_ticker?: string;
}

export interface GetFillsParams {
  ticker?: string;
  order_id?: string;
  limit?: number;
  cursor?: string;
  min_ts?: number;
  max_ts?: number;
}

export interface CreateOrderParams {
  ticker: string;
  side: "yes" | "no";
  action: "buy" | "sell";
  count: number;
  yes_price?: number; // cents — required for limit orders on yes side
  no_price?: number; // cents — required for limit orders on no side
  client_order_id?: string;
  expiration_ts?: number;
}

export interface KalshiApiError {
  code: string;
  message: string;
  service?: string;
  details?: string;
}

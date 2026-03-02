import "server-only";
import * as crypto from "node:crypto";
import { log } from "@/lib/logger";
import type {
  CreateOrderParams,
  GetEventsParams,
  GetFillsParams,
  GetMarketsParams,
  GetOrdersParams,
  GetPositionsParams,
  GetTradesParams,
  KalshiApiError,
  KalshiBalance,
  KalshiCredentials,
  KalshiEvent,
  KalshiFill,
  KalshiMarket,
  KalshiOrder,
  KalshiOrderbook,
  KalshiPosition,
  KalshiTrade,
} from "./types";

export const KALSHI_BASE_URL = "https://api.elections.kalshi.com/trade-api/v2";

// ─── Auth signing ─────────────────────────────────────────────────────────────

/**
 * Generates Kalshi RSA-PSS auth headers for a request.
 * Message format: timestamp + METHOD + /trade-api/v2/...
 */
function buildAuthHeaders(
  credentials: KalshiCredentials,
  method: string,
  path: string
): Record<string, string> {
  const timestamp = Date.now().toString();
  // Path must start from /trade-api/... (strip domain if full URL passed)
  const signingPath = path.startsWith("http")
    ? new URL(path).pathname
    : path.startsWith("/trade-api")
      ? path
      : `/trade-api/v2${path}`;

  const message = timestamp + method.toUpperCase() + signingPath;
  const privateKey = crypto.createPrivateKey(credentials.privateKeyPem);

  const signature = crypto.sign("sha256", Buffer.from(message), {
    key: privateKey,
    padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
    saltLength: crypto.constants.RSA_PSS_SALTLEN_DIGEST,
  });

  return {
    "KALSHI-ACCESS-KEY": credentials.apiKey,
    "KALSHI-ACCESS-SIGNATURE": signature.toString("base64"),
    "KALSHI-ACCESS-TIMESTAMP": timestamp,
    "Content-Type": "application/json",
  };
}

// ─── HTTP helpers ─────────────────────────────────────────────────────────────

export class KalshiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string
  ) {
    super(message);
    this.name = "KalshiError";
  }
}

async function kalshiFetch<T>(
  credentials: KalshiCredentials,
  method: "GET" | "POST" | "DELETE" | "PATCH",
  path: string,
  params?: Record<string, string | number | boolean | undefined>,
  body?: unknown
): Promise<T> {
  let url = `${KALSHI_BASE_URL}${path}`;

  if (params) {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined) qs.set(k, String(v));
    }
    const qsStr = qs.toString();
    if (qsStr) url += `?${qsStr}`;
  }

  // Sign against the path portion only (no query string)
  const signingPath = `/trade-api/v2${path}`;
  const headers = buildAuthHeaders(credentials, method, signingPath);

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store", // Never cache — trading data must always be live
  });

  if (!res.ok) {
    let errorData: KalshiApiError | null = null;
    try {
      errorData = (await res.json()) as KalshiApiError;
    } catch {
      // ignore parse errors
    }
    log.error("kalshi", `${method} ${path} → ${res.status}`, {
      status: res.status,
      code: errorData?.code,
      message: errorData?.message ?? res.statusText,
    });
    throw new KalshiError(
      res.status,
      errorData?.code ?? "unknown",
      errorData?.message ?? `Kalshi API error: ${res.status} ${res.statusText}`
    );
  }

  return res.json() as Promise<T>;
}

// ─── Kalshi API client ────────────────────────────────────────────────────────

export function createKalshiClient(credentials: KalshiCredentials) {
  const get = <T>(
    path: string,
    params?: Record<string, string | number | boolean | undefined>
  ) => kalshiFetch<T>(credentials, "GET", path, params);

  const post = <T>(path: string, body: unknown) =>
    kalshiFetch<T>(credentials, "POST", path, undefined, body);

  const del = <T>(path: string) => kalshiFetch<T>(credentials, "DELETE", path);

  return {
    // ── Events ──────────────────────────────────────────────────────────────

    async getEvents(params: GetEventsParams = {}): Promise<{
      events: KalshiEvent[];
      cursor?: string;
    }> {
      return get("/events", {
        limit: params.limit,
        cursor: params.cursor,
        status: params.status,
        series_ticker: params.series_ticker,
        with_nested_markets: params.with_nested_markets,
      });
    },

    async getEvent(eventTicker: string): Promise<{ event: KalshiEvent }> {
      return get(`/events/${eventTicker}`);
    },

    // ── Markets ──────────────────────────────────────────────────────────────

    async getMarkets(params: GetMarketsParams = {}): Promise<{
      markets: KalshiMarket[];
      cursor?: string;
    }> {
      return get("/markets", {
        limit: params.limit,
        cursor: params.cursor,
        event_ticker: params.event_ticker,
        series_ticker: params.series_ticker,
        max_close_ts: params.max_close_ts,
        min_close_ts: params.min_close_ts,
        status: params.status,
        tickers: params.tickers,
      });
    },

    async getMarket(ticker: string): Promise<{ market: KalshiMarket }> {
      return get(`/markets/${ticker}`);
    },

    async getOrderbook(
      ticker: string,
      depth?: number
    ): Promise<{ orderbook: KalshiOrderbook }> {
      return get(`/markets/${ticker}/orderbook`, { depth });
    },

    // ── Trades ────────────────────────────────────────────────────────────────

    async getTrades(params: GetTradesParams = {}): Promise<{
      trades: KalshiTrade[];
      cursor?: string;
    }> {
      return get("/trades", {
        ticker: params.ticker,
        limit: params.limit,
        cursor: params.cursor,
        min_ts: params.min_ts,
        max_ts: params.max_ts,
      });
    },

    // ── Portfolio: balance ────────────────────────────────────────────────────

    async getBalance(): Promise<KalshiBalance> {
      return get("/portfolio/balance");
    },

    // ── Portfolio: positions ──────────────────────────────────────────────────

    async getPositions(params: GetPositionsParams = {}): Promise<{
      positions: KalshiPosition[];
      cursor?: string;
    }> {
      return get("/portfolio/positions", {
        limit: params.limit,
        cursor: params.cursor,
        count_filter: params.count_filter,
        settlement_status: params.settlement_status,
        ticker: params.ticker,
        event_ticker: params.event_ticker,
      });
    },

    // ── Portfolio: orders ─────────────────────────────────────────────────────

    async getOrders(params: GetOrdersParams = {}): Promise<{
      orders: KalshiOrder[];
      cursor?: string;
    }> {
      return get("/portfolio/orders", {
        ticker: params.ticker,
        event_ticker: params.event_ticker,
        status: params.status,
        limit: params.limit,
        cursor: params.cursor,
        min_ts: params.min_ts,
        max_ts: params.max_ts,
      });
    },

    async getOrder(orderId: string): Promise<{ order: KalshiOrder }> {
      return get(`/portfolio/orders/${orderId}`);
    },

    /**
     * Place a limit order. Market orders were removed from Kalshi on Feb 11, 2026.
     * For yes-side orders, supply yes_price. For no-side orders, supply no_price.
     */
    async createOrder(params: CreateOrderParams): Promise<{
      order: KalshiOrder;
    }> {
      return post("/portfolio/orders", {
        ticker: params.ticker,
        side: params.side,
        action: params.action,
        count: params.count,
        type: "limit",
        yes_price: params.yes_price,
        no_price: params.no_price,
        client_order_id: params.client_order_id,
        expiration_ts: params.expiration_ts,
      });
    },

    async cancelOrder(orderId: string): Promise<{ order: KalshiOrder }> {
      return del(`/portfolio/orders/${orderId}`);
    },

    // ── Portfolio: fills ──────────────────────────────────────────────────────

    async getFills(params: GetFillsParams = {}): Promise<{
      fills: KalshiFill[];
      cursor?: string;
    }> {
      return get("/portfolio/fills", {
        ticker: params.ticker,
        order_id: params.order_id,
        limit: params.limit,
        cursor: params.cursor,
        min_ts: params.min_ts,
        max_ts: params.max_ts,
      });
    },
  };
}

export type KalshiClient = ReturnType<typeof createKalshiClient>;

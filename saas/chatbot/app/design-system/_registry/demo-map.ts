import { lazy } from "react";

// Lazy-loaded demo components keyed by registry entry id.
// Each demo file exports a default component.

export const DEMO_MAP: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
  // ── Atoms ──
  "button": lazy(() => import("./demos/atoms/button-demo")),
  "badge": lazy(() => import("./demos/atoms/badge-demo")),
  "input": lazy(() => import("./demos/atoms/input-demo")),
  "textarea": lazy(() => import("./demos/atoms/textarea-demo")),
  "label": lazy(() => import("./demos/atoms/label-demo")),
  "select": lazy(() => import("./demos/atoms/select-demo")),
  "progress": lazy(() => import("./demos/atoms/progress-demo")),
  "skeleton": lazy(() => import("./demos/atoms/skeleton-demo")),
  "avatar": lazy(() => import("./demos/atoms/avatar-demo")),
  "tooltip": lazy(() => import("./demos/atoms/tooltip-demo")),
  "separator": lazy(() => import("./demos/atoms/separator-demo")),
  "scroll-area": lazy(() => import("./demos/atoms/scroll-area-demo")),
  "collapsible": lazy(() => import("./demos/atoms/collapsible-demo")),
  "carousel": lazy(() => import("./demos/atoms/carousel-demo")),

  // ── Molecules ──
  "alert": lazy(() => import("./demos/molecules/alert-demo")),
  "card": lazy(() => import("./demos/molecules/card-demo")),
  "price-pill": lazy(() => import("./demos/molecules/price-pill-demo")),
  "edge-meter": lazy(() => import("./demos/molecules/edge-meter-demo")),
  "nav-sidebar": lazy(() => import("./demos/molecules/nav-sidebar-demo")),
  "breadcrumbs": lazy(() => import("./demos/molecules/breadcrumbs-demo")),
  "tab-bar": lazy(() => import("./demos/molecules/tab-bar-demo")),
  "stat-card": lazy(() => import("./demos/molecules/stat-card-demo")),
  "chat-message": lazy(() => import("./demos/molecules/chat-message-demo")),
  "activity-feed": lazy(() => import("./demos/molecules/activity-feed-demo")),
  "watchlist-item": lazy(() => import("./demos/molecules/watchlist-item-demo")),
  "data-table-row": lazy(() => import("./demos/molecules/data-table-row-demo")),
  "dialog": lazy(() => import("./demos/molecules/dialog-demo")),
  "alert-dialog": lazy(() => import("./demos/molecules/alert-dialog-demo")),
  "sheet": lazy(() => import("./demos/molecules/sheet-demo")),
  "dropdown-menu": lazy(() => import("./demos/molecules/dropdown-menu-demo")),
  "hover-card": lazy(() => import("./demos/molecules/hover-card-demo")),
  "command": lazy(() => import("./demos/molecules/command-demo")),
  "button-group": lazy(() => import("./demos/molecules/button-group-demo")),
  "input-group": lazy(() => import("./demos/molecules/input-group-demo")),

  // ── Components ──
  "pnl-display": lazy(() => import("./demos/components/pnl-display-demo")),
  "order-confirmation": lazy(() => import("./demos/components/order-confirmation-demo")),
  "portfolio-summary": lazy(() => import("./demos/components/portfolio-summary-demo")),
  "market-overview": lazy(() => import("./demos/components/market-overview-demo")),
  "chat-input": lazy(() => import("./demos/components/chat-input-demo")),
  "command-palette": lazy(() => import("./demos/components/command-palette-demo")),
  "kalshi-connection": lazy(() => import("./demos/components/kalshi-connection-demo")),
  "theme-toggle": lazy(() => import("./demos/components/theme-toggle-demo")),
};

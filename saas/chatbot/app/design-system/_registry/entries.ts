import type { RegistryEntry } from "./types";

export const REGISTRY: RegistryEntry[] = [
  // ── Atoms ──────────────────────────────────────────────────────
  // Buttons
  { id: "button", label: "Button", level: "atom", sublabel: "Buttons", source: "@/components/ui/button", description: "6 variants, brand CTA, sizes, and states" },
  // Badges
  { id: "badge", label: "Badge", level: "atom", sublabel: "Badges", source: "@/components/ui/badge", description: "4 variants + trading signal, confidence, and strategy badges" },
  // Form Controls
  { id: "input", label: "Input", level: "atom", sublabel: "Form Controls", source: "@/components/ui/input", description: "Default, disabled, and error states" },
  { id: "textarea", label: "Textarea", level: "atom", sublabel: "Form Controls", source: "@/components/ui/textarea", description: "Multi-line text input" },
  { id: "label", label: "Label", level: "atom", sublabel: "Form Controls", source: "@/components/ui/label", description: "Form field label" },
  { id: "select", label: "Select", level: "atom", sublabel: "Form Controls", source: "@/components/ui/select", description: "Dropdown select with strategy picker demo" },
  // Feedback
  { id: "progress", label: "Progress", level: "atom", sublabel: "Feedback", source: "@/components/ui/progress", description: "Default, edge meter, and brand gradient progress bars" },
  { id: "skeleton", label: "Skeleton", level: "atom", sublabel: "Feedback", source: "@/components/ui/skeleton", description: "Content and avatar loading placeholders" },
  // Display
  { id: "avatar", label: "Avatar", level: "atom", sublabel: "Display", source: "@/components/ui/avatar", description: "User avatar with fallback initials and icons" },
  { id: "tooltip", label: "Tooltip", level: "atom", sublabel: "Display", source: "@/components/ui/tooltip", description: "Hover info display with various triggers" },
  { id: "separator", label: "Separator", level: "atom", sublabel: "Display", source: "@/components/ui/separator", description: "Horizontal and vertical dividers" },
  // Scrolling
  { id: "scroll-area", label: "ScrollArea", level: "atom", sublabel: "Scrolling", source: "@/components/ui/scroll-area", description: "Custom scrollbar container" },
  { id: "collapsible", label: "Collapsible", level: "atom", sublabel: "Scrolling", source: "@/components/ui/collapsible", description: "Expand/collapse content section" },
  { id: "carousel", label: "Carousel", level: "atom", sublabel: "Scrolling", source: "@/components/ui/carousel", description: "Slide-based content carousel with nav arrows" },

  // ── Molecules ──────────────────────────────────────────────────
  // Alerts
  { id: "alert", label: "Alert", level: "molecule", sublabel: "Alerts", source: "@/components/ui/alert", description: "5 variants: default, destructive, success, info, warning" },
  // Cards
  { id: "card", label: "Card", level: "molecule", sublabel: "Cards", source: "@/components/ui/card", description: "Standard, position, and market card layouts" },
  // Trading
  { id: "price-pill", label: "Price Pill", level: "molecule", sublabel: "Trading", source: "custom", description: "Yes/No/Even price indicators" },
  { id: "edge-meter", label: "Edge Meter", level: "molecule", sublabel: "Trading", source: "custom", description: "Strong/moderate/weak edge confidence bars" },
  // Navigation
  { id: "nav-sidebar", label: "Nav Sidebar Items", level: "molecule", sublabel: "Navigation", source: "custom", description: "Active state, badge counts, and icon navigation" },
  { id: "breadcrumbs", label: "Breadcrumbs", level: "molecule", sublabel: "Navigation", source: "custom", description: "3-level breadcrumb navigation" },
  { id: "tab-bar", label: "Tab Bar", level: "molecule", sublabel: "Navigation", source: "custom", description: "Horizontal tab navigation with active indicator" },
  // Dashboard
  { id: "stat-card", label: "Stat Card", level: "molecule", sublabel: "Dashboard", source: "custom", description: "Metric + label + trend badge + mini bar" },
  { id: "chat-message", label: "Chat Message", level: "molecule", sublabel: "Dashboard", source: "custom", description: "AI and user message bubbles" },
  { id: "activity-feed", label: "Activity Feed Item", level: "molecule", sublabel: "Dashboard", source: "custom", description: "Trade/event notification with timestamp" },
  { id: "watchlist-item", label: "Watchlist Item", level: "molecule", sublabel: "Dashboard", source: "custom", description: "Market ticker + price + change" },
  { id: "data-table-row", label: "Data Table Row", level: "molecule", sublabel: "Dashboard", source: "custom", description: "Position data in table format" },
  // Overlays
  { id: "dialog", label: "Dialog", level: "molecule", sublabel: "Overlays", source: "@/components/ui/dialog", description: "Modal dialog with overlay, close, header/footer" },
  { id: "alert-dialog", label: "Alert Dialog", level: "molecule", sublabel: "Overlays", source: "@/components/ui/alert-dialog", description: "Confirmation dialog with action/cancel" },
  { id: "sheet", label: "Sheet", level: "molecule", sublabel: "Overlays", source: "@/components/ui/sheet", description: "Slide-out panel with side variants" },
  { id: "dropdown-menu", label: "Dropdown Menu", level: "molecule", sublabel: "Overlays", source: "@/components/ui/dropdown-menu", description: "Contextual menu with items, shortcuts, separators" },
  { id: "hover-card", label: "Hover Card", level: "molecule", sublabel: "Overlays", source: "@/components/ui/hover-card", description: "Card popover on hover" },
  // Input Groups
  { id: "command", label: "Command", level: "molecule", sublabel: "Input Groups", source: "@/components/ui/command", description: "cmdk-based searchable command palette" },
  { id: "button-group", label: "Button Group", level: "molecule", sublabel: "Input Groups", source: "@/components/ui/button-group", description: "Grouped buttons with horizontal/vertical orientation" },
  { id: "input-group", label: "Input Group", level: "molecule", sublabel: "Input Groups", source: "@/components/ui/input-group", description: "Input with addons, buttons, and text decorators" },

  // ── Components ─────────────────────────────────────────────────
  // Trading
  { id: "pnl-display", label: "P&L Display", level: "component", sublabel: "Trading", source: "custom", description: "Portfolio P&L summary with per-position breakdown" },
  { id: "order-confirmation", label: "Order Confirmation", level: "component", sublabel: "Trading", source: "custom", description: "Trade review card with edge score" },
  // Dashboard
  { id: "portfolio-summary", label: "Portfolio Summary", level: "component", sublabel: "Dashboard", source: "custom", description: "Balance + positions + win rate stat cards" },
  { id: "market-overview", label: "Market Overview", level: "component", sublabel: "Dashboard", source: "custom", description: "Market card with chart area and action button" },
  // AI Chat
  { id: "chat-input", label: "Chat Input", level: "component", sublabel: "AI Chat", source: "custom", description: "Input bar with model selector and attachments" },
  { id: "command-palette", label: "Command Palette", level: "component", sublabel: "AI Chat", source: "custom", description: "Search/command interface with keyboard shortcuts" },
  // Settings
  { id: "kalshi-connection", label: "Kalshi Connection", level: "component", sublabel: "Settings", source: "@/components/kalshi-connection-form", description: "API key connection form with status" },
  { id: "theme-toggle", label: "Theme Toggle", level: "component", sublabel: "Settings", source: "custom", description: "Light/dark mode toggle button" },
];

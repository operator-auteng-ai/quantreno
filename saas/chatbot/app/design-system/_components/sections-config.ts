import {
  Sparkles,
  Palette,
  Type,
  MousePointerClick,
  Tag,
  RectangleHorizontal,
  CreditCard,
  AlertCircle,
  LineChart,
  Navigation,
  Layers,
  Atom,
  FlaskConical,
  Component,
  Boxes,
  Activity,
  Hash,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type Section = {
  id: string;
  label: string;
  icon: LucideIcon;
  count: number;
};

export type GalleryCategory = {
  id: string;
  label: string;
  icon: LucideIcon;
  count: number;
  description: string;
  linkTo: string;
  tab: "components" | "tokens";
};

// ── Components page: Atoms → Molecules → Components ──
export const COMPONENT_SECTIONS: readonly Section[] = [
  { id: "atoms", label: "Atoms", icon: Atom, count: 12 },
  { id: "molecules", label: "Molecules", icon: FlaskConical, count: 12 },
  { id: "components", label: "Components", icon: Component, count: 6 },
] as const;

// ── Tokens page: Primitives, Colors, Typography, Shadows, Motion, Z-Index, Animations ──
export const TOKEN_SECTIONS: readonly Section[] = [
  { id: "primitives", label: "Primitives", icon: Sparkles, count: 4 },
  { id: "colors", label: "Colors", icon: Palette, count: 5 },
  { id: "typography", label: "Typography", icon: Type, count: 2 },
  { id: "shadows", label: "Shadows", icon: Boxes, count: 6 },
  { id: "motion", label: "Motion", icon: Zap, count: 3 },
  { id: "zindex", label: "Z-Index", icon: Hash, count: 5 },
  { id: "animations", label: "Animations", icon: Activity, count: 5 },
] as const;

// ── Gallery: overview of all categories ──
export const GALLERY_CATEGORIES: readonly GalleryCategory[] = [
  // Components
  { id: "atoms", label: "Atoms", icon: Atom, count: 12, description: "Buttons, badges, inputs, labels, progress, skeleton, avatar, tooltip, separator", linkTo: "/design-system/components#atoms", tab: "components" },
  { id: "molecules", label: "Molecules", icon: FlaskConical, count: 12, description: "Alerts, cards, price pills, edge meters, nav items, stat cards, chat messages", linkTo: "/design-system/components#molecules", tab: "components" },
  { id: "components", label: "Components", icon: Component, count: 6, description: "P&L display, order confirmation, portfolio summary, market overview, chat input", linkTo: "/design-system/components#components", tab: "components" },
  // Tokens
  { id: "primitives", label: "Primitives", icon: Sparkles, count: 4, description: "Indigo, mint, teal, and neutral color scales (11 steps each)", linkTo: "/design-system/tokens#primitives", tab: "tokens" },
  { id: "colors", label: "Colors", icon: Palette, count: 5, description: "Core palette, brand, signal, confidence, and chart colors", linkTo: "/design-system/tokens#colors", tab: "tokens" },
  { id: "typography", label: "Typography", icon: Type, count: 2, description: "Geist Sans for interface, Geist Mono for data", linkTo: "/design-system/tokens#typography", tab: "tokens" },
  { id: "motion-tokens", label: "Motion & Effects", icon: Zap, count: 14, description: "Shadows, transitions, z-index scale, keyframe animations", linkTo: "/design-system/tokens#shadows", tab: "tokens" },
] as const;

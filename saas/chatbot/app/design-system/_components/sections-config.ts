import {
  Sparkles,
  Palette,
  Type,
  Atom,
  FlaskConical,
  Component,
  Boxes,
  Activity,
  Hash,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getCounts, getGalleryDescriptions } from "../_registry/helpers";

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

// Derive counts from the canonical registry
const counts = getCounts();
const descriptions = getGalleryDescriptions();

// ── Components page: Atoms → Molecules → Components ──
export const COMPONENT_SECTIONS: readonly Section[] = [
  { id: "atoms", label: "Atoms", icon: Atom, count: counts.atom },
  { id: "molecules", label: "Molecules", icon: FlaskConical, count: counts.molecule },
  { id: "components", label: "Components", icon: Component, count: counts.component },
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
  // Components — counts derived from registry
  { id: "atoms", label: "Atoms", icon: Atom, count: counts.atom, description: descriptions.atoms, linkTo: "/design-system/components#atoms", tab: "components" },
  { id: "molecules", label: "Molecules", icon: FlaskConical, count: counts.molecule, description: descriptions.molecules, linkTo: "/design-system/components#molecules", tab: "components" },
  { id: "components", label: "Components", icon: Component, count: counts.component, description: descriptions.components, linkTo: "/design-system/components#components", tab: "components" },
  // Tokens — static counts
  { id: "primitives", label: "Primitives", icon: Sparkles, count: 4, description: "Indigo, mint, teal, and neutral color scales (11 steps each)", linkTo: "/design-system/tokens#primitives", tab: "tokens" },
  { id: "colors", label: "Colors", icon: Palette, count: 5, description: "Core palette, brand, signal, confidence, and chart colors", linkTo: "/design-system/tokens#colors", tab: "tokens" },
  { id: "typography", label: "Typography", icon: Type, count: 2, description: "Geist Sans for interface, Geist Mono for data", linkTo: "/design-system/tokens#typography", tab: "tokens" },
  { id: "motion-tokens", label: "Motion & Effects", icon: Zap, count: 14, description: "Shadows, transitions, z-index scale, keyframe animations", linkTo: "/design-system/tokens#shadows", tab: "tokens" },
] as const;

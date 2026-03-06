import { REGISTRY } from "./entries";
import type { AtomicLevel, RegistryEntry } from "./types";

export function getByLevel(level: AtomicLevel): RegistryEntry[] {
  return REGISTRY.filter((e) => e.level === level);
}

export function getGrouped(level: AtomicLevel): Record<string, RegistryEntry[]> {
  const entries = getByLevel(level);
  const groups: Record<string, RegistryEntry[]> = {};
  for (const entry of entries) {
    if (!groups[entry.sublabel]) groups[entry.sublabel] = [];
    groups[entry.sublabel].push(entry);
  }
  return groups;
}

export function getCounts() {
  return {
    atom: getByLevel("atom").length,
    molecule: getByLevel("molecule").length,
    component: getByLevel("component").length,
  };
}

export function getGalleryDescriptions() {
  return {
    atoms: getByLevel("atom").map((e) => e.label).join(", "),
    molecules: getByLevel("molecule").map((e) => e.label).join(", "),
    components: getByLevel("component").map((e) => e.label).join(", "),
  };
}

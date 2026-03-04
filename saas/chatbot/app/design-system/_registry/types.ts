export type AtomicLevel = "atom" | "molecule" | "component";

export type RegistryEntry = {
  id: string;
  label: string;
  level: AtomicLevel;
  sublabel: string;
  source: string;
  description: string;
};

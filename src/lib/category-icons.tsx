import {
  Lock, Wrench, BatteryFull, Cog, Settings2, Disc3, ShieldCheck, Filter,
  Package, Droplet, CircleDot, Gauge, Zap, Sparkles, Fuel, Disc,
  type LucideIcon,
} from "lucide-react";

/**
 * Maps a category name or slug to a distinct icon. Matching is keyword-based
 * so it stays correct regardless of how many categories the database returns
 * or in what order — no more relying on array position.
 */
const RULES: { keywords: string[]; icon: LucideIcon }[] = [
  { keywords: ["accessoire"], icon: Lock },
  { keywords: ["atelier", "chimi"], icon: Wrench },
  { keywords: ["batter"], icon: BatteryFull },
  { keywords: ["cadre"], icon: Settings2 },
  { keywords: ["chassis", "châssis"], icon: Cog },
  { keywords: ["échappement", "echappement", "exhaust"], icon: Fuel },
  { keywords: ["étanche", "etanche", "seal"], icon: ShieldCheck },
  { keywords: ["filtration", "filtre"], icon: Filter },
  { keywords: ["kit", "entretien"], icon: Package },
  { keywords: ["lubrifiant", "additif", "huile"], icon: Droplet },
  { keywords: ["moteur", "engine"], icon: Cog },
  { keywords: ["pneu", "tire"], icon: CircleDot },
  { keywords: ["roulement", "bearing"], icon: CircleDot },
  { keywords: ["suspension"], icon: Gauge },
  { keywords: ["alimentation", "carbur"], icon: Fuel },
  { keywords: ["freinage", "frein", "brake"], icon: Disc3 },
  { keywords: ["électrique", "electrique", "electric"], icon: Zap },
  { keywords: ["transmission"], icon: Disc },
  { keywords: ["trottinette", "scooter électrique"], icon: Zap },
  { keywords: ["gadget", "marchandise"], icon: Sparkles },
];

export function getCategoryIcon(nameOrSlug: string): LucideIcon {
  const key = nameOrSlug.toLowerCase();
  const match = RULES.find((r) => r.keywords.some((k) => key.includes(k)));
  return match?.icon ?? Package;
}

export interface UpgradeDef {
  id: string;
  name: string;
  description: string;
  maxLevel: number;
  baseCost: number;
  costScale: number;
}

export const UPGRADES: UpgradeDef[] = [
  {
    id: 'webStrength',
    name: 'Web Strength',
    description: 'Slingshot stretches further before snapping',
    maxLevel: 5,
    baseCost: 15,
    costScale: 1.5,
  },
  {
    id: 'anchorSense',
    name: 'Anchor Sense',
    description: 'Anchor points glow from further away',
    maxLevel: 5,
    baseCost: 10,
    costScale: 1.4,
  },
  {
    id: 'silkShield',
    name: 'Silk Shield',
    description: 'Extra web-catch save per run',
    maxLevel: 3,
    baseCost: 30,
    costScale: 2.0,
  },
  {
    id: 'ghostWeb',
    name: 'Ghost Web',
    description: 'Shows trail from your last run',
    maxLevel: 1,
    baseCost: 25,
    costScale: 1,
  },
  {
    id: 'stickyTime',
    name: 'Sticky Time',
    description: 'Brief slow-motion on web attachment',
    maxLevel: 3,
    baseCost: 20,
    costScale: 1.8,
  },
];

export function getUpgradeCost(upgrade: UpgradeDef, currentLevel: number): number {
  return Math.floor(upgrade.baseCost * Math.pow(upgrade.costScale, currentLevel));
}

export function getUpgradeLevel(upgrades: Record<string, number>, id: string): number {
  return upgrades[id] ?? 0;
}

export function applyUpgradeEffects(upgrades: Record<string, number>): UpgradeEffects {
  return {
    slingshotMaxStretch: 120 + getUpgradeLevel(upgrades, 'webStrength') * 25,
    anchorSenseRange: 350 + getUpgradeLevel(upgrades, 'anchorSense') * 50,
    extraWebCatches: getUpgradeLevel(upgrades, 'silkShield'),
    ghostWebEnabled: getUpgradeLevel(upgrades, 'ghostWeb') > 0,
    stickyTimeSeconds: getUpgradeLevel(upgrades, 'stickyTime') * 0.15,
  };
}

export interface UpgradeEffects {
  slingshotMaxStretch: number;
  anchorSenseRange: number;
  extraWebCatches: number;
  ghostWebEnabled: boolean;
  stickyTimeSeconds: number;
}

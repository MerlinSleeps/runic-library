export const DOMAIN = {
  Fury: "Fury",
  Calm: "Calm",
  Body: "Body",
  Mind: "Mind",
  Chaos: "Chaos",
  Order: "Order",
} as const;

export type Domain = keyof typeof DOMAIN;
export type DomainValue = (typeof DOMAIN)[Domain];

/** Badge styles per domain, matching the colors of the in-game domain icons. */
export const DOMAIN_BADGE_CLASSES: Record<string, string> = {
  Fury: "bg-red-950/60 text-red-200 border-red-700/60",
  Calm: "bg-emerald-950/60 text-emerald-200 border-emerald-700/60",
  Body: "bg-orange-950/60 text-orange-200 border-orange-700/60",
  Mind: "bg-sky-950/60 text-sky-200 border-sky-700/60",
  Chaos: "bg-purple-950/60 text-purple-200 border-purple-700/60",
  Order: "bg-yellow-950/60 text-yellow-200 border-yellow-700/60",
};

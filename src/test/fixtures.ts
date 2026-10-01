import type { Card, DeckEntry } from '@/types/card';

let nextId = 1;

/** Creates a card with sensible defaults; only the fields a test cares about need to be passed. */
export function makeCard(overrides: Partial<Card> = {}): Card {
  const id = overrides.id ?? `test-${nextId++}`;
  return {
    id,
    collectorNumber: 1,
    set: 'TEST',
    name: overrides.name ?? `Card ${id}`,
    description: '',
    type: 'Unit',
    rarity: 'Common',
    faction: 'Mind',
    stats: { energy: 0, might: 0, cost: 1, power: 0 },
    keywords: [],
    art: { thumbnailURL: '', fullURL: '', artist: '' },
    flavorText: '',
    tags: [],
    ...overrides,
  };
}

export function entry(card: Card, count = 1): DeckEntry {
  return { card, count };
}

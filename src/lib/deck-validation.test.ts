import { describe, expect, it } from 'vitest';
import { validateDeck, type DeckToValidate } from './deck-validation';
import { entry, makeCard } from '@/test/fixtures';

const ahri = makeCard({ name: 'Nine-Tailed Fox', type: 'Legend', faction: 'Mind Calm', tags: ['Ahri'] });

/** A complete, legal deck for an Ahri (Mind + Calm) Legend. */
function buildValidDeck(): DeckToValidate {
  // 13 different cards x 3 copies + 1 = 40 main deck cards
  const mainDeck = Array.from({ length: 13 }, (_, i) =>
    entry(makeCard({ faction: i % 2 === 0 ? 'Mind' : 'Calm' }), 3)
  );
  mainDeck.push(entry(makeCard({ name: 'Recruit', faction: 'Colorless' }), 1));

  return {
    championLegend: ahri,
    mainDeck,
    runeDeck: [
      entry(makeCard({ name: 'Mind Rune', type: 'Rune', faction: 'Mind' }), 6),
      entry(makeCard({ name: 'Calm Rune', type: 'Rune', faction: 'Calm' }), 6),
    ],
    battlefieldDeck: ['Altar to Unity', "Aspirant's Climb", 'Back-Alley Bar'].map((name) =>
      entry(makeCard({ name, type: 'Battlefield', faction: 'Colorless' }))
    ),
  };
}

describe('validateDeck', () => {
  it('accepts a complete deck that follows all construction rules', () => {
    const result = validateDeck(buildValidDeck());

    expect(result.mainDeckErrors).toEqual([]);
    expect(result.runeDeckErrors).toEqual([]);
    expect(result.battlefieldDeckErrors).toEqual([]);
    expect(result.domainIdentity).toEqual(['Mind', 'Calm']);
    expect(result.isDeckValid).toBe(true);
  });

  it('rejects a deck without a Legend', () => {
    const result = validateDeck({ ...buildValidDeck(), championLegend: null });

    expect(result.isDeckValid).toBe(false);
  });

  it('flags cards outside the Legend\'s domain identity', () => {
    const deck = buildValidDeck();
    deck.mainDeck[0] = entry(makeCard({ name: 'Furious Brawler', faction: 'Fury' }), 3);

    const result = validateDeck(deck);

    expect(result.mainDeckErrors).toContain('Furious Brawler: Not in your Domain Identity.');
    expect(result.isDeckValid).toBe(false);
  });

  it('enforces the copy limit and exact deck sizes', () => {
    const deck = buildValidDeck();
    deck.mainDeck[0] = entry(deck.mainDeck[0].card, 4); // 41 cards, 4 copies
    deck.runeDeck = deck.runeDeck.slice(0, 1); // only 6 runes

    const result = validateDeck(deck);

    expect(result.mainDeckErrors).toContain(`${deck.mainDeck[0].card.name}: Max 3 copies allowed.`);
    expect(result.isMainDeckSizeValid).toBe(false);
    expect(result.isRuneDeckSizeValid).toBe(false);
    expect(result.isDeckValid).toBe(false);
  });

  it('allows colorless battlefields but rejects duplicates', () => {
    const deck = buildValidDeck();
    deck.battlefieldDeck[2] = entry(makeCard({ name: 'Altar to Unity', type: 'Battlefield', faction: 'Colorless' }));

    const result = validateDeck(deck);

    expect(result.battlefieldDeckErrors).toEqual(['Battlefield deck cannot have duplicate cards.']);
    expect(result.isBattlefieldDeckUnique).toBe(false);
    expect(result.isDeckValid).toBe(false);
  });
});

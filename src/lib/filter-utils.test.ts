import { describe, expect, it } from 'vitest';
import { parseCardFilters, parseSearchQuery, toURLSearchParams, type CardFilters } from './filter-utils';

describe('parseSearchQuery', () => {
  it('splits quoted text into tags and keeps the rest as the name', () => {
    expect(parseSearchQuery('Sett  "Ionia" "Champion"')).toEqual({ name: 'Sett', tags: ['Ionia', 'Champion'] });
  });

  it('handles empty input', () => {
    expect(parseSearchQuery('')).toEqual({ name: '', tags: [] });
  });
});

describe('parseCardFilters', () => {
  it('falls back to safe defaults for invalid paging values', () => {
    const filters = parseCardFilters(new URLSearchParams('page=abc&limit=-5'));

    expect(filters.page).toBe(1);
    expect(filters.limit).toBe(40);
  });

  it('caps the page size to prevent oversized queries', () => {
    expect(parseCardFilters(new URLSearchParams('limit=5000')).limit).toBe(100);
  });

  it('merges quoted tags from the name with explicit tag params', () => {
    const filters = parseCardFilters(new URLSearchParams('name=Ahri%20%22Ionia%22&tags=Spirit'));

    expect(filters.name).toBe('Ahri');
    expect(filters.tags).toEqual(['Ionia', 'Spirit']);
  });

  it('round-trips with toURLSearchParams', () => {
    const original: CardFilters = {
      name: 'Blade',
      category: 'MainDeck',
      type: 'Spell',
      factions: ['Mind', 'Calm'],
      rarity: 'Rare',
      sort: 'cost',
      order: 'desc',
      page: 2,
      limit: 20,
    };

    expect(parseCardFilters(toURLSearchParams(original))).toEqual({ ...original, tags: undefined });
  });
});

import type { Card } from "@/types/card";

export type CardCategory = 'All' | 'Legend' | 'Battlefield' | 'MainDeck' | 'Rune';
export type SortOption = 'name' | 'cost' | 'might';
export type SortDirection = 'asc' | 'desc';

export interface CardFilters {
  name?: string;
  tags?: string[];
  factions?: string[];
  rarity?: string;
  type?: string;
  category?: CardCategory;
  sort?: SortOption;
  order?: SortDirection;
  page?: number;
  limit?: number;
}

export interface PaginatedResult {
  data: Card[];
  total: number;
  totalPages: number;
}

const QUOTED_TAG_PATTERN = /"([^"]+)"/g;

/**
 * Splits a search input into a name part and tags.
 * Text in double quotes is treated as a tag: `Sett "Ionia"` -> name "Sett", tags ["Ionia"].
 */
export function parseSearchQuery(input: string): { name: string; tags: string[] } {
  if (!input) return { name: '', tags: [] };

  const tags = Array.from(input.matchAll(QUOTED_TAG_PATTERN), (match) => match[1].trim());
  const name = input.replace(QUOTED_TAG_PATTERN, '').replace(/\s+/g, ' ').trim();

  return { name, tags };
}

/**
 * Reads card filters from URL search params. The `name` param may contain quoted tags.
 */
export function parseCardFilters(searchParams: URLSearchParams): CardFilters {
  const { name, tags: quotedTags } = parseSearchQuery(searchParams.get('name') ?? '');
  const tags = [...quotedTags, ...searchParams.getAll('tags')];
  const factions = searchParams.getAll('factions');

  return {
    name: name || undefined,
    tags: tags.length > 0 ? tags : undefined,
    factions: factions.length > 0 ? factions : undefined,
    type: searchParams.get('type') || undefined,
    rarity: searchParams.get('rarity') || undefined,
    category: (searchParams.get('category') as CardCategory) || undefined,
    sort: (searchParams.get('sort') as SortOption) || undefined,
    order: (searchParams.get('order') as SortDirection) || undefined,
    page: parsePositiveInt(searchParams.get('page')) ?? 1,
    limit: Math.min(parsePositiveInt(searchParams.get('limit')) ?? 40, 100),
  };
}

function parsePositiveInt(value: string | null): number | undefined {
  if (!value) return undefined;
  const num = Number(value);
  return Number.isInteger(num) && num > 0 ? num : undefined;
}

export function toURLSearchParams(filters: CardFilters): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.name) params.set('name', filters.name);
  if (filters.category) params.set('category', filters.category);
  if (filters.rarity) params.set('rarity', filters.rarity);
  if (filters.type) params.set('type', filters.type);
  if (filters.sort) params.set('sort', filters.sort);
  if (filters.order) params.set('order', filters.order);
  filters.factions?.forEach((f) => params.append('factions', f));
  filters.tags?.forEach((t) => params.append('tags', t));
  if (filters.page) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));

  return params;
}

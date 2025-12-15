import { Card } from "@/types/card";

export interface CardFilters {
  name?: string;
  tags?: string[];
  factions?: string[];
  rarity?: string;
  type?: string;
  category?: 'Legend' | 'Battlefield' | 'MainDeck' | 'Rune' | 'All';
  minCost?: number;
  maxCost?: number;
  minMight?: number;
  maxMight?: number;
  sort?: 'name' | 'cost' | 'might';
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface PaginatedResult {
  data: Card[];
  total: number;
  totalPages: number;
}

export function parseSearchQuery(input: string): { name: string; tags: string[] } {
  if (!input) return { name: '', tags: [] };

  // Extract text inside quotes as tags
  const tagMatches = input.match(/"([^"]+)"/g);

  const tags = tagMatches
    ? tagMatches.map(t => t.replace(/"/g, '').trim())
    : [];

  // Remove tags from the name string and clean up whitespace
  const name = input.replace(/"([^"]+)"/g, '').replace(/\s+/g, ' ').trim();

  return { name, tags };
}

export function parseCardFilters(searchParams: URLSearchParams): CardFilters {
  return {
    name: searchParams.get('name') || undefined,
    tags: searchParams.getAll('tags').length > 0 ? searchParams.getAll('tags') : undefined,
    factions: searchParams.getAll('factions').length > 0
      ? searchParams.getAll('factions')
      : undefined,
    type: searchParams.get('type') || undefined,
    rarity: searchParams.get('rarity') || undefined,
    category: (searchParams.get('category') as CardFilters['category']) || undefined,

    // Safe Number Parsing (prevents NaN)
    minCost: parseNumber(searchParams.get('minCost')),
    maxCost: parseNumber(searchParams.get('maxCost')),
    minMight: parseNumber(searchParams.get('minMight')),
    maxMight: parseNumber(searchParams.get('maxMight')),

    sort: (searchParams.get('sort') as CardFilters['sort']) || undefined,
    order: (searchParams.get('order') as CardFilters['order']) || undefined,

    page: parseNumber(searchParams.get('page')) || 1,
    limit: parseNumber(searchParams.get('limit')) || 40,
  };
}

// Helper to avoid NaN
function parseNumber(value: string | null): number | undefined {
  if (!value) return undefined;
  const num = Number(value);
  return isNaN(num) ? undefined : num;
}

export function toURLSearchParams(filters: CardFilters): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.name) params.set('name', filters.name);
  if (filters.category) params.set('category', filters.category);
  if (filters.rarity) params.set('rarity', filters.rarity);
  if (filters.type) params.set('type', filters.type);
  if (filters.sort) params.set('sort', filters.sort);
  if (filters.order) params.set('order', filters.order);

  // Numeric filters
  if (filters.minCost !== undefined) params.set('minCost', String(filters.minCost));
  if (filters.maxCost !== undefined) params.set('maxCost', String(filters.maxCost));
  if (filters.minMight !== undefined) params.set('minMight', String(filters.minMight));
  if (filters.maxMight !== undefined) params.set('maxMight', String(filters.maxMight));

  // Arrays (Factions & Tags)
  if (filters.factions) {
    filters.factions.forEach(f => params.append('factions', f));
  }
  if (filters.tags) {
    filters.tags.forEach(t => params.append('tags', t));
  }

  // Pagination
  if (filters.page) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));

  return params;
}
import { db } from '@/db';
import { cards } from '@/db/schema';
import { and, asc, desc, eq, ilike, inArray, ne, or, sql, type SQL } from 'drizzle-orm';
import type { Card } from '@/types/card';
import { CARD_TYPE } from '@/constants/card-type';
import type { CardCategory, CardFilters, PaginatedResult } from '@/lib/filter-utils';

const DEFAULT_PAGE_SIZE = 40;

const CATEGORY_CONDITIONS: Record<Exclude<CardCategory, 'All'>, SQL> = {
  Legend: eq(cards.type, CARD_TYPE.Legend),
  Battlefield: eq(cards.type, CARD_TYPE.Battlefield),
  Rune: eq(cards.type, CARD_TYPE.Rune),
  MainDeck: inArray(cards.type, [CARD_TYPE.Unit, CARD_TYPE.Spell, CARD_TYPE.Gear]),
};

const SORT_COLUMNS = {
  name: cards.name,
  cost: cards.cost,
  might: cards.might,
} as const;

function buildConditions(filters: CardFilters): SQL[] {
  const conditions: SQL[] = [];

  if (filters.name) {
    conditions.push(ilike(cards.name, `%${filters.name}%`));
  }

  if (filters.factions?.length) {
    // A card matches if it belongs to ANY of the selected factions.
    conditions.push(or(...filters.factions.map((f) => ilike(cards.faction, `%${f}%`)))!);
  }

  // Showcase cards are alternate arts, so they are hidden unless explicitly requested.
  conditions.push(filters.rarity ? eq(cards.rarity, filters.rarity) : ne(cards.rarity, 'Showcase'));

  if (filters.category && filters.category !== 'All') {
    conditions.push(CATEGORY_CONDITIONS[filters.category]);
  }

  if (filters.type) {
    conditions.push(eq(cards.type, filters.type));
  }

  if (filters.tags?.length) {
    conditions.push(sql`${cards.data}->'tags' @> ${JSON.stringify(filters.tags)}::jsonb`);
  }

  return conditions;
}

export async function getAllCards(filters: CardFilters = {}): Promise<PaginatedResult> {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? DEFAULT_PAGE_SIZE;
  const where = and(...buildConditions(filters));

  const sortColumn = SORT_COLUMNS[filters.sort ?? 'name'];
  const orderBy = filters.order === 'desc' ? desc(sortColumn) : asc(sortColumn);

  const [[{ count }], rows] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(cards).where(where),
    db
      .select({ data: cards.data })
      .from(cards)
      .where(where)
      .orderBy(orderBy, asc(cards.id))
      .limit(limit)
      .offset((page - 1) * limit),
  ]);

  const total = Number(count);

  return {
    data: rows.map((row) => row.data as Card),
    total,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getCardById(cardId: string): Promise<Card | null> {
  const [row] = await db
    .select({ data: cards.data })
    .from(cards)
    .where(eq(cards.id, cardId))
    .limit(1);

  return row ? (row.data as Card) : null;
}

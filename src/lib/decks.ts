import { db } from '@/db';
import { cards, decks, deckCards, users } from '@/db/schema';
import { and, desc, eq, sql } from 'drizzle-orm';
import type { Card, DeckEntry } from '@/types/card';

export interface DeckSummary {
  id: string;
  name: string;
  createdAt: Date;
  cardCount: number;
}

export interface DeckDetail {
  id: string;
  name: string;
  createdAt: Date;
  cards: DeckEntry[];
}

export async function ensureUserExists(userId: string, email: string) {
  await db
    .insert(users)
    .values({ id: userId, email })
    .onConflictDoNothing();
}

export async function createDeck(userId: string, deckName: string, entries: DeckEntry[]) {
  // The neon-http driver does not support interactive transactions,
  // so the deck ID is generated up front and both inserts run as one batch.
  const deckId = crypto.randomUUID();

  const insertDeck = db.insert(decks).values({
    id: deckId,
    userId,
    name: deckName,
    visibility: 'private',
  });

  if (entries.length === 0) {
    await insertDeck;
    return deckId;
  }

  const insertCards = db.insert(deckCards).values(
    entries.map((entry) => ({
      deckId,
      cardId: entry.card.id,
      count: entry.count,
    }))
  );

  await db.batch([insertDeck, insertCards]);
  return deckId;
}

export async function getUserDecks(userId: string): Promise<DeckSummary[]> {
  const rows = await db
    .select({
      id: decks.id,
      name: decks.name,
      createdAt: decks.createdAt,
      cardCount: sql<number>`coalesce(sum(${deckCards.count}), 0)`,
    })
    .from(decks)
    .leftJoin(deckCards, eq(deckCards.deckId, decks.id))
    .where(eq(decks.userId, userId))
    .groupBy(decks.id)
    .orderBy(desc(decks.createdAt));

  return rows.map((row) => ({ ...row, cardCount: Number(row.cardCount) }));
}

export async function getUserDeck(userId: string, deckId: string): Promise<DeckDetail | null> {
  const [deck] = await db
    .select({ id: decks.id, name: decks.name, createdAt: decks.createdAt })
    .from(decks)
    .where(and(eq(decks.id, deckId), eq(decks.userId, userId)))
    .limit(1);

  if (!deck) return null;

  const rows = await db
    .select({ count: deckCards.count, data: cards.data })
    .from(deckCards)
    .innerJoin(cards, eq(cards.id, deckCards.cardId))
    .where(eq(deckCards.deckId, deckId));

  return {
    ...deck,
    cards: rows.map((row) => ({ card: row.data as Card, count: row.count })),
  };
}

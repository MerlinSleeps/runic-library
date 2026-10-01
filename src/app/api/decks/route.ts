import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/firebaseAdmin';
import { createDeck, ensureUserExists, getUserDecks } from '@/lib/decks';
import type { Card, DeckEntry } from '@/types/card';

interface SaveDeckBody {
  name?: unknown;
  deck?: {
    legend?: Card | null;
    mainDeck?: DeckEntry[];
    runeDeck?: DeckEntry[];
    battlefieldDeck?: DeckEntry[];
  };
}

const MAX_DECK_NAME_LENGTH = 100;

function isDeckEntryList(value: unknown): value is DeckEntry[] {
  return (
    Array.isArray(value) &&
    value.every(
      (entry) =>
        typeof entry?.card?.id === 'string' &&
        Number.isInteger(entry?.count) &&
        entry.count > 0
    )
  );
}

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const decks = await getUserDecks(user.uid);
    return NextResponse.json(decks);
  } catch (error) {
    console.error('Error fetching decks:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: SaveDeckBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const { legend, mainDeck = [], runeDeck = [], battlefieldDeck = [] } = body.deck ?? {};

  if (!name || name.length > MAX_DECK_NAME_LENGTH) {
    return NextResponse.json(
      { error: `Deck name must be between 1 and ${MAX_DECK_NAME_LENGTH} characters.` },
      { status: 400 }
    );
  }
  if (!legend?.id || ![mainDeck, runeDeck, battlefieldDeck].every(isDeckEntryList)) {
    return NextResponse.json({ error: 'Invalid deck data' }, { status: 400 });
  }

  try {
    await ensureUserExists(user.uid, user.email ?? 'no-email');

    const entries: DeckEntry[] = [
      { card: legend, count: 1 },
      ...mainDeck,
      ...runeDeck,
      ...battlefieldDeck,
    ];
    const deckId = await createDeck(user.uid, name, entries);

    return NextResponse.json({ deckId }, { status: 201 });
  } catch (error) {
    console.error('Error saving deck:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

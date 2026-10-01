import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/firebaseAdmin';
import { getUserDeck } from '@/lib/decks';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ deckId: string }> }
) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { deckId } = await params;
  if (!UUID_PATTERN.test(deckId)) {
    return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
  }

  try {
    const deck = await getUserDeck(user.uid, deckId);
    if (!deck) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
    }
    return NextResponse.json(deck);
  } catch (error) {
    console.error('Error fetching deck:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

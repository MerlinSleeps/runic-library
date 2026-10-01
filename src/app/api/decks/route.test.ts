import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { entry, makeCard } from '@/test/fixtures';

// Firebase and the database are replaced by mocks, so the route logic is tested in isolation.
vi.mock('@/lib/firebaseAdmin', () => ({ getAuthenticatedUser: vi.fn() }));
vi.mock('@/lib/decks', () => ({
  createDeck: vi.fn(),
  ensureUserExists: vi.fn(),
  getUserDecks: vi.fn(),
}));

import { GET, POST } from './route';
import { getAuthenticatedUser } from '@/lib/firebaseAdmin';
import { createDeck, getUserDecks } from '@/lib/decks';

const user = { uid: 'user-1', email: 'test@example.com' };

function postRequest(body: unknown) {
  return new NextRequest('http://localhost/api/decks', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

describe('/api/decks', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns 401 when the request is not authenticated', async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue(null);

    const response = await GET(new NextRequest('http://localhost/api/decks'));

    expect(response.status).toBe(401);
    expect(getUserDecks).not.toHaveBeenCalled();
  });

  it('rejects a deck without a name or Legend with 400', async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user);

    const noName = await POST(postRequest({ name: '   ', deck: { legend: makeCard() } }));
    const noLegend = await POST(postRequest({ name: 'My Deck', deck: { mainDeck: [] } }));

    expect(noName.status).toBe(400);
    expect(noLegend.status).toBe(400);
    expect(createDeck).not.toHaveBeenCalled();
  });

  it('saves a valid deck for the authenticated user', async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user);
    vi.mocked(createDeck).mockResolvedValue('deck-123');

    const legend = makeCard({ type: 'Legend' });
    const unit = entry(makeCard(), 3);
    const rune = entry(makeCard({ type: 'Rune' }), 12);

    const response = await POST(
      postRequest({ name: '  Ahri Control ', deck: { legend, mainDeck: [unit], runeDeck: [rune], battlefieldDeck: [] } })
    );

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ deckId: 'deck-123' });
    expect(createDeck).toHaveBeenCalledWith('user-1', 'Ahri Control', [entry(legend, 1), unit, rune]);
  });
});

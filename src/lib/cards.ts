import { db } from '@/db';
import { cards } from '@/db/schema';
import { eq, and, ilike, or, SQL, sql, Column, asc, desc, inArray } from 'drizzle-orm';
import type { Card } from '@/types/card';
import { CARD_TYPE } from '@/constants/card-type';
import { CardFilters, PaginatedResult } from '@/lib/filter-utils';

export async function getAllCards(filters: CardFilters = {}): Promise<PaginatedResult> {
    const conditions: SQL[] = [];
    const page = filters.page || 1;
    const limit = filters.limit || 40;
    const offset = (page - 1) * limit;

    // 1. Text Search (Case insensitive)
    if (filters.name) {
        conditions.push(ilike(cards.name, `%${filters.name}%`));
    }

    // 2. Factions (OR logic: Card matches ANY of the selected factions)
    if (filters.factions && filters.factions.length > 0) {
        const factionConditions = filters.factions.map(f =>
            ilike(cards.faction, `%${f}%`)
        );
        conditions.push(or(...factionConditions)!);
    }

    // 3. Rarity
    if (filters.rarity) {
        conditions.push(eq(cards.rarity, filters.rarity));
    } else {
        // By default, hide Showcase cards unless specifically asked for
        conditions.push(sql`${cards.rarity} != 'Showcase'`);
    }

    // 4. Category Filter (The Main Toggles)
    if (filters.category) {
        switch (filters.category) {
            case 'Legend':
                conditions.push(ilike(cards.type, `%${CARD_TYPE.Legend}%`));
                break;
            case 'Battlefield':
                conditions.push(ilike(cards.type, `%${CARD_TYPE.Battlefield}%`));
                break;
            case 'Rune':
                conditions.push(ilike(cards.type, `%${CARD_TYPE.Rune}%`));
                break;
            case 'MainDeck':
                conditions.push(inArray(cards.type, [CARD_TYPE.Unit, CARD_TYPE.Spell, CARD_TYPE.Gear]));
                break;
        }
    }

    // 5. Tags
    if (filters.tags) {
        conditions.push(sql`${cards.data}->'tags' @> ${JSON.stringify(filters.tags)}`);
    }

    // --- Query 1: Get Total Count ---
    // We run a separate query just to count matching rows efficiently
    const totalResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(cards)
        .where(and(...conditions));

    const total = Number(totalResult[0].count);

    // --- Query 2: Get Data ---
    let orderByClause: SQL | Column = cards.name; // Default
    if (filters.sort === 'cost') orderByClause = cards.cost;
    if (filters.sort === 'might') orderByClause = cards.might;

    const query = db
        .select()
        .from(cards)
        .where(and(...conditions))
        .limit(limit)
        .offset(offset)
        .$dynamic();

    // Apply Sort Direction
    if (filters.order === 'desc') {
        await query.orderBy(desc(orderByClause));
    } else {
        await query.orderBy(asc(orderByClause));
    }

    const result = await query;
    const data = result.map((row) => row.data as unknown as Card);

    return {
        data,
        total,
        totalPages: Math.ceil(total / limit)
    };
}


export async function getCardById(cardId: string): Promise<Card | null> {
    const result = await db
        .select()
        .from(cards)
        .where(eq(cards.id, cardId))
        .limit(1);

    if (result.length === 0) return null;
    return result[0].data as unknown as Card;
}
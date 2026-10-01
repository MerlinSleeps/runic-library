import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { sql } from 'drizzle-orm';
import * as schema from '../src/db/schema';
import apiResponse from '../data/RIFTBOUND_DUMMY_DATA_NOV-2025.json';

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!connectionString) {
    throw new Error('❌ No database connection string found! Check your .env.local file.');
}

const pool = new Pool({
    connectionString: connectionString,
    ssl: true,
});

const db = drizzle(pool, { schema });

async function seed() {
    console.log('🌱 Seeding Cards to SQL...');

    const allCards = apiResponse.sets.flatMap((set) => set.cards);
    console.log(`Found ${allCards.length} cards across ${apiResponse.sets.length} sets.`);

    const rows = allCards.map((card) => ({
        id: card.id,
        name: card.name,
        cost: card.stats.cost,
        power: card.stats.power,
        might: card.stats.might,
        faction: card.faction,
        type: card.type,
        rarity: card.rarity,
        data: card,
    }));

    // Upsert in one statement and refresh every column, so corrections in the JSON
    // (e.g. a Legend's domains) also update the filterable columns.
    await db.insert(schema.cards).values(rows).onConflictDoUpdate({
        target: schema.cards.id,
        set: {
            name: sql`excluded.name`,
            cost: sql`excluded.cost`,
            power: sql`excluded.power`,
            might: sql`excluded.might`,
            faction: sql`excluded.faction`,
            type: sql`excluded.type`,
            rarity: sql`excluded.rarity`,
            data: sql`excluded.data`,
        },
    });

    console.log(`✅ Seeding Complete! Upserted ${rows.length} cards.`);
    await pool.end();
}

seed().catch((err) => {
    console.error(err);
    process.exit(1);
});
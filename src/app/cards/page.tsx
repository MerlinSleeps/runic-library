import { getAllCards } from '@/lib/cards';
import CardGrid from './CardGrid';
import { parseCardFilters } from '@/lib/filter-utils';

export const revalidate = 0;

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function toURLSearchParams(params: Record<string, string | string[] | undefined>) {
  const result = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    for (const v of [value ?? []].flat()) result.append(key, v);
  }
  return result;
}

export default async function CardsPage(props: PageProps) {
  const filters = parseCardFilters(toURLSearchParams(await props.searchParams));

  // Without an explicit category, a name search covers all cards; browsing starts with the main deck.
  filters.category ??= filters.name || filters.tags ? 'All' : 'MainDeck';

  const { data, totalPages } = await getAllCards(filters);

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Card Gallery</h1>
      <CardGrid
        cards={data}
        totalPages={totalPages}
        currentPage={filters.page ?? 1}
        initialCategory={filters.category}
      />
    </main>
  );
}

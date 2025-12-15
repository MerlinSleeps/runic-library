import { getAllCards } from '@/lib/cards';
import CardGrid from './CardGrid';
import { parseSearchQuery } from '@/lib/utils';
import { CardFilters } from '@/lib/filter-utils';

export const revalidate = 0; // Disable cache to see live changes

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CardsPage(props: PageProps) {
  const searchParams = await props.searchParams;

  const rawName = (searchParams.name as string) || '';

  const { name, tags } = parseSearchQuery(rawName);

  const parseArray = (param: string | string[] | undefined) => {
    if (!param) return undefined;
    return Array.isArray(param) ? param : [param];
  };

  const page = Number(searchParams.page) || 1;

  const filters: CardFilters = {
    name: name,
    tags: tags,
    category: (searchParams.category as CardFilters['category']) || 'All',
    factions: parseArray(searchParams.factions),
    rarity: searchParams.rarity as string,
    type: searchParams.type as string,
    sort: searchParams.sort as CardFilters['sort'],
    order: searchParams.order as CardFilters['order'],
    page: page,
    limit: Number(searchParams.limit) || 40,
  };

  const { data, total, totalPages } = await getAllCards(filters);

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Card Gallery</h1>
      <CardGrid
        initialCards={data}
        totalCards={total}
        totalPages={totalPages}
        currentPage={page}
      />
    </main>
  );
}
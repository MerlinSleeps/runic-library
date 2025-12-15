import { getAllCards } from '@/lib/cards';
import { DeckBuilderProvider } from '@/context/DeckBuilderContext';
import DeckBuilderDragDropWrapper from '@/components/builder/DeckBuilderDragDropWrapper';
import DeckList from '@/components/builder/DeckList';
import BuilderCardGrid from '@/components/builder/BuilderCardGrid';

export const revalidate = 3600;

export default async function BuildPage() {
  const initialCards = await getAllCards({ category: 'Legend' });

  return (
    <DeckBuilderProvider>
      <DeckBuilderDragDropWrapper>
        <main className="container mx-auto p-4">
          <h1 className="text-3xl font-bold mb-6">Deck Builder</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <BuilderCardGrid initialCards={initialCards.data} />
            </div>

            <div className="lg:col-span-1">
              <DeckList />
            </div>
          </div>
        </main>
      </DeckBuilderDragDropWrapper>
    </DeckBuilderProvider>
  );
}
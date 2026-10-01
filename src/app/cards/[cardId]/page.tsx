import { getCardById } from '@/lib/cards';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CardImage } from '@/components/ui/CardImage';

interface CardDetailPageProps {
  params: Promise<{
    cardId: string;
  }>;
}

export default async function CardDetailPage({ params }: CardDetailPageProps) {
  const { cardId } = await params;
  const card = await getCardById(cardId);

  if (!card) {
    return (
      <main className="container mx-auto p-4 flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold font-arcane text-primary">Card not found</h1>
          <p className="text-muted-foreground">We couldn&apos;t find a card with the ID: {cardId}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto p-4 md:p-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 max-w-6xl mx-auto">
        {/* Left Column: Art */}
        <div className="flex flex-col gap-4">
          <div className="relative w-full aspect-[2/3] md:aspect-auto md:h-[calc(100vh-200px)] max-h-[800px] overflow-hidden rounded-xl shadow-2xl border border-border/50 bg-black/20">
            <CardImage
              src={card.art.thumbnailURL}
              alt={card.name}
            />
          </div>
          {card.art.artist && (
            <p className="text-center text-sm text-muted-foreground">
              Art by <span className="text-foreground font-medium">{card.art.artist}</span>
            </p>
          )}
        </div>

        {/* Right Column: Details */}
        <div className="flex flex-col space-y-6 md:py-4">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2 mb-2">
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 uppercase tracking-wider">
                {card.rarity}
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-secondary text-secondary-foreground border border-border uppercase tracking-wider">
                {card.type}
              </span>
              {card.faction && (
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-accent text-accent-foreground border border-border uppercase tracking-wider">
                  {card.faction}
                </span>
              )}
            </div>
            <h1 className="text-4xl md:text-6xl font-arcane text-primary leading-tight">
              {card.name}
            </h1>
          </div>

          <Separator className="bg-border/60" />

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 p-4 rounded-xl bg-secondary/30 border border-border/50">
            <div className="text-center space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Power</p>
              <p className="text-2xl md:text-3xl font-bold text-red-500/90 font-arcane">{card.stats.power}</p>
            </div>
            <div className="text-center space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Energy</p>
              <p className="text-2xl md:text-3xl font-bold text-blue-500/90 font-arcane">{card.stats.energy}</p>
            </div>
            <div className="text-center space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Might</p>
              <p className="text-2xl md:text-3xl font-bold text-yellow-500/90 font-arcane">{card.stats.might}</p>
            </div>
          </div>

          {/* Keywords */}
          {card.keywords && card.keywords.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {card.keywords.map((keyword) => (
                <span key={keyword} className="px-3 py-1 rounded-md text-sm font-medium bg-secondary/80 text-secondary-foreground border border-border/50">
                  {keyword}
                </span>
              ))}
            </div>
          )}

          {/* Description */}
          <div className="space-y-4 flex-grow">
            <p className="text-lg md:text-xl leading-relaxed text-foreground/90 whitespace-pre-wrap">
              {card.description}
            </p>
            {card.flavorText && (
              <p className="text-base italic text-muted-foreground border-l-2 border-primary/20 pl-4 py-1">
                &ldquo;{card.flavorText}&rdquo;
              </p>
            )}
            {/* Tags - Made more prominent */}
            {card.tags && card.tags.length > 0 && (
              <div className="flex flex-col items-start gap-3 pt-6">
                <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground/80">Tags</h3>
                <div className="flex flex-wrap justify-start gap-2">
                  {card.tags.map(tag => (
                    <Button
                      key={tag}
                      variant="secondary"
                      className="bg-white text-zinc-900 hover:bg-zinc-100 border border-zinc-200 h-8 text-sm font-medium shadow-sm transition-colors"
                    >
                      {tag}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-auto pt-6 space-y-4">
            <Separator className="bg-border/60" />
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <div className="flex flex-col">
                <span className="text-xs uppercase tracking-wider opacity-70">Set</span>
                <span className="font-semibold text-foreground">{card.set}</span>
              </div>
              {card.collectorNumber && (
                <div className="flex flex-col items-end">
                  <span className="text-xs uppercase tracking-wider opacity-70">Collector #</span>
                  <span className="font-mono">{card.collectorNumber}</span>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}

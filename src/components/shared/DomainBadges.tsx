import { DOMAIN_BADGE_CLASSES } from '@/constants/domains';
import { cn } from '@/lib/utils';

interface DomainBadgesProps {
  /** Space-separated domains as stored on the card, e.g. "Mind Calm". */
  faction: string;
  className?: string;
}

export function DomainBadges({ faction, className }: DomainBadgesProps) {
  const domains = faction.split(' ').filter(Boolean);

  return (
    <ul className={cn('flex flex-wrap gap-1.5', className)} aria-label="Domains">
      {domains.map((domain) => (
        <li
          key={domain}
          className={cn(
            'px-2 py-0.5 rounded-full border text-xs font-semibold uppercase tracking-wide',
            DOMAIN_BADGE_CLASSES[domain] ?? 'bg-gray-800 text-gray-300 border-gray-700'
          )}
        >
          {domain}
        </li>
      ))}
    </ul>
  );
}

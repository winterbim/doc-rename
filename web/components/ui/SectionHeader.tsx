import { Badge } from './Badge';

interface SectionHeaderProps {
  kicker?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
  badge?: string;
}

export function SectionHeader({
  kicker,
  title,
  description,
  align = 'left',
  badge,
}: SectionHeaderProps) {
  return (
    <div className={`${align === 'center' ? 'text-center' : ''} max-w-3xl`}>
      {badge && (
        <div className={align === 'center' ? 'flex justify-center mb-4' : 'mb-4'}>
          <Badge variant="primary">{badge}</Badge>
        </div>
      )}
      {kicker && (
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">
          {kicker}
        </p>
      )}
      <h2 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-lg text-ink-soft leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}

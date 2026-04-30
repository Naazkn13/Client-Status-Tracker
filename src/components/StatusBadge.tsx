import type { StatusColor } from '../lib/supabase';

interface StatusBadgeProps {
  color: StatusColor;
  size?: 'sm' | 'md';
}

export const STATUS_CONFIG: Record<StatusColor, { label: string; bg: string; border: string; text: string; dot: string }> = {
  red: {
    label: 'Client is upset – Needs immediate attention',
    bg: 'bg-red-500',
    border: 'border-red-600',
    text: 'text-white',
    dot: 'bg-red-500',
  },
  yellow: {
    label: 'Items to be delivered but under control',
    bg: 'bg-amber-400',
    border: 'border-amber-500',
    text: 'text-amber-900',
    dot: 'bg-amber-400',
  },
  green: {
    label: 'No issues',
    bg: 'bg-emerald-500',
    border: 'border-emerald-600',
    text: 'text-white',
    dot: 'bg-emerald-500',
  },
  blue: {
    label: 'Client has gone cold',
    bg: 'bg-sky-400',
    border: 'border-sky-500',
    text: 'text-white',
    dot: 'bg-sky-400',
  },
  black: {
    label: 'Client lost',
    bg: 'bg-gray-900',
    border: 'border-black',
    text: 'text-white',
    dot: 'bg-gray-900',
  },
};

export default function StatusBadge({ color, size = 'md' }: StatusBadgeProps) {
  const config = STATUS_CONFIG[color];
  if (size === 'sm') {
    return (
      <span
        className={`inline-block w-5 h-5 rounded-sm border ${config.bg} ${config.border}`}
        title={config.label}
      />
    );
  }
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold border ${config.bg} ${config.border} ${config.text} whitespace-nowrap`}
      title={config.label}
    >
      {config.label}
    </span>
  );
}

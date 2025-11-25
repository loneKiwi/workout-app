import { cn } from '@/lib/utils';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';

function SimpleAvatar({
  image,
  label,
  size = 'sm',
  shape = 'square',
  loading = false,
}: {
  image: string | undefined;
  label: string;
  size?: 'sm' | 'default' | 'md' | 'lg' | 'xl';
  shape?: 'circle' | 'square';
  loading?: boolean;
}) {
  return (
    <Avatar
      className={cn(
        'size-4 shrink-0 rounded-sm overflow-hidden bg-muted',
        size === 'default' &&
          'size-5 text-xs rounded-[calc(var(--radius)-4px)]',
        size === 'sm' && 'size-4.5 text-xs rounded-[calc(var(--radius)-4px)]',
        size === 'md' && 'size-6 rounded-[calc(var(--radius)-2px)]',
        size === 'lg' && 'size-8 rounded',
        size === 'xl' && 'size-10 rounded-md',
        shape === 'circle' && 'rounded-full',
        loading && 'bg-accent animate-pulse'
      )}
    >
      {loading === false && (
        <AvatarImage className="object-cover" src={image || undefined} />
      )}
      {image === undefined && loading === false && (
        <AvatarFallback
          className={cn(
            'rounded-none',
            size === 'default' && 'text-xs',
            size === 'sm' && 'text-xs',
            size === 'md' && 'text-sm',
            size === 'lg' && 'text-base'
          )}
        >
          {label?.charAt(0)}
        </AvatarFallback>
      )}
    </Avatar>
  );
}

export { SimpleAvatar };

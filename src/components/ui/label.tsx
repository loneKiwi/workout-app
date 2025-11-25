'use client';

import { cn } from '@/lib/utils';
import * as LabelPrimitive from '@radix-ui/react-label';
import * as React from 'react';

interface LabelProps extends React.ComponentProps<typeof LabelPrimitive.Root> {
  size?: 'lg' | 'sm' | 'default';
  weight?: 'heavy' | 'light';
  tint?: 'light' | 'dark';
}

function Label({ className, size, weight, tint, ...props }: LabelProps) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        'flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
        size === 'lg' && 'text-base',
        size === 'sm' && 'text-xs',
        size === 'default' && 'text-sm',
        weight === 'heavy' && 'font-semibold',
        weight === 'light' && 'font-normal',
        tint === 'light' && 'text-foreground/60',
        tint === 'dark' && 'text-foreground',
        className
      )}
      {...props}
    />
  );
}

export { Label };

import { cva } from 'class-variance-authority';
import { CheckIcon, X } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Tooltip } from '@/components/ui/tooltip';

const statusIndicatorVariants = cva(
  'shrink-0 aspect-square transition-colors duration-200 rounded-full flex flex-col items-center justify-center',
  {
    variants: {
      status: {
        Preparing:
          'border border-dashed border-purple-500 data-[mode=action]:hover:border-purple-700',
        Requested:
          'border border-dashed border-orange-500 data-[mode=action]:hover:border-orange-700',
        'In Progress':
          'border border-solid border-blue-500 data-[mode=action]:hover:border-blue-700',
        Complete:
          'bg-blue-500 rounded-full data-[mode=action]:hover:bg-blue-700',
        Cancelled:
          'border border-dashed border-gray-500 data-[mode=action]:hover:border-gray-700',
        Unknown:
          'border border-dashed border-red-500 bg-red-500 data-[mode=action]:hover:border-red-700',
      },
      size: {
        sm: 'size-3.5',
        md: 'size-4',
        lg: 'size-4.5',
      },
    },
    defaultVariants: {
      status: 'Unknown',
      size: 'sm',
    },
  }
);

const statusIconVariants = cva('', {
  variants: {
    status: {
      Preparing: '',
      Requested: '',
      'In Progress':
        'fill-blue-500 stroke-blue-500 data-[mode=action]:hover:fill-blue-700 data-[mode=action]:hover:stroke-blue-700',
      Complete: 'stroke-white',
      Cancelled:
        'fill-gray-500 stroke-gray-500 data-[mode=action]:hover:fill-gray-700 data-[mode=action]:hover:stroke-gray-700',
      Unknown: '',
    },
    size: {
      sm: 'size-2.5',
      md: 'size-3',
      lg: 'size-3.5',
    },
  },
  defaultVariants: {
    status: 'Unknown',
    size: 'sm',
  },
});

export enum StatusType {
  Preparing = 'Preparing',
  Requested = 'Requested',
  InProgress = 'In Progress',
  Complete = 'Complete',
  Cancelled = 'Cancelled',
}

type StatusIndicatorProps = {
  status?: StatusType;
  size?: 'sm' | 'md' | 'lg';
  tooltip?: boolean;
  mode?: 'action' | 'view';
  className?: string;
  loading?: boolean;
};

export function StatusIndicator({
  status,
  size = 'sm',
  tooltip = true,
  mode = 'view',
  loading = false,
  className,
}: StatusIndicatorProps) {
  const renderIcon = () => {
    const iconClassName = cn(statusIconVariants({ status: status, size }));

    switch (status) {
      case StatusType.InProgress:
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            data-mode={mode}
            className={iconClassName}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              className={iconClassName}
              d="M12 21a9 9 0 0 1 0-18v18Z"
              transform="rotate(180 12 12)"
            />
          </svg>
        );
      case StatusType.Complete:
        return <CheckIcon className={iconClassName} />;
      case StatusType.Cancelled:
        return <X data-mode={mode} className={iconClassName} />;
      default:
        return null;
    }
  };
  if (loading) {
    return (
      <div
        data-mode={mode}
        className={cn(
          statusIndicatorVariants({ status: status, size }),
          'animate-pulse bg-accent border-none',
          className
        )}
      ></div>
    );
  }

  const indicator = (
    <div
      data-mode={mode}
      className={cn(
        statusIndicatorVariants({ status: status, size }),
        className
      )}
    >
      {renderIcon()}
    </div>
  );

  if (tooltip && status) {
    return <Tooltip label={status}>{indicator}</Tooltip>;
  }

  return indicator;
}

export { statusIconVariants, statusIndicatorVariants };

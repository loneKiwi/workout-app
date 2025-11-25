'use client';

import {
  CheckIcon,
  InfoIcon,
  LoaderIcon,
  TriangleAlertIcon,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useMemo } from 'react';
import {
  Toaster as Sonner,
  toast as sonnerToast,
  type ExternalToast,
  type ToasterProps,
} from 'sonner';

import { cn } from '@/lib/utils';
import { Button } from './button';
import { Text } from './text';

function Toaster({ ...props }: ToasterProps) {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      position="bottom-center"
      icons={{
        success: null,
        info: null,
        warning: null,
        error: null,
        loading: null,
      }}
      closeButton={false}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: 'bg-transparent p-0 shadow-none border-0',
          content: 'p-0',
          icon: 'hidden',
          closeButton: 'hidden',
        },
      }}
      {...props}
    />
  );
}

type ActionProps = {
  label: string;
  onClick: () => void;
};

type Actions = {
  primary?: ActionProps;
  secondary?: ActionProps;
};

type ToastStatus =
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'loading'
  | undefined;

type ToastStyleTokens = {
  label: string;
  description: string;
};

type CustomToastOptions = ExternalToast & {
  description?: string;
  actions?: Actions;
};

const BASE_TOKENS: ToastStyleTokens = {
  label: '',
  description: 'text-muted-foreground',
};

const STATUS_TOKENS: Record<
  Exclude<ToastStatus, undefined>,
  Partial<ToastStyleTokens>
> = {
  success: {
    label: 'text-foreground',
    description: 'text-muted-foreground',
  },
  error: {
    label: 'text-red-700',
    description: 'text-red-500 dark:text-red-800',
  },
  warning: {
    label: 'text-foreground',
    description: 'text-muted-foreground',
  },
  info: {
    label: 'text-foreground',
    description: 'text-muted-foreground',
  },
  loading: {
    label: 'text-foreground',
    description: 'text-muted-foreground',
  },
};

const ICON_MAP = {
  success: CheckIcon,
  error: TriangleAlertIcon,
  warning: TriangleAlertIcon,
  info: InfoIcon,
  loading: LoaderIcon,
} as const;

const getToastTokens = (status: ToastStatus): ToastStyleTokens => {
  if (!status) {
    return BASE_TOKENS;
  }

  return {
    ...BASE_TOKENS,
    ...(STATUS_TOKENS[status] ?? {}),
  };
};

function CustomToaster({
  status,
  label,
  actions,
  description,
  id,
  dismissible,
}: ToasterProps & {
  status?: 'success' | 'error' | 'warning' | 'info' | 'loading';
  label: string;
  actions?: Actions;
  description?: string;
  id?: string | number;
  dismissible?: boolean;
}) {
  const desc = useMemo(() => {
    if (
      description === '' ||
      description === undefined ||
      description === null
    ) {
      return null;
    }
    return description;
  }, [description]);

  const tokens = useMemo(() => getToastTokens(status), [status]);
  const IconComponent = status ? ICON_MAP[status] : InfoIcon;
  const hasDescription = Boolean(desc);

  return (
    <div className="border-border bg-card relative flex w-90 items-start gap-3 overflow-hidden rounded-xl border px-5 py-4 shadow-lg transition-all flex flex-col">
      <div className="flex items-start w-full justify-between gap-3">
        <div className="flex flex-col gap-1">
          <Text className={cn('text-base font-semibold', tokens.label)}>
            {label}
          </Text>
          {hasDescription && (
            <Text
              size="sm"
              className={cn('text-sm font-normal', tokens.description)}
            >
              {description}
            </Text>
          )}
        </div>
        {status === 'loading' && (
          <IconComponent className="size-5 animate-spin" />
        )}
      </div>
      <ToastActions
        actions={actions}
        hidden={status === 'loading'}
        id={id}
        dismissible={dismissible}
      />
    </div>
  );
}

const render = (
  status: ToastStatus,
  label: string,
  opts: CustomToastOptions
) => {
  const ToastRenderer = (id: number | string) => (
    <CustomToaster
      id={id}
      status={status}
      label={label}
      description={opts.description}
      actions={opts.actions}
      dismissible={opts.dismissible}
    />
  );

  ToastRenderer.displayName = 'ToastRenderer';

  return ToastRenderer;
};

const toast = Object.assign(
  (label: string, opts: CustomToastOptions = {}) =>
    sonnerToast.custom(render(undefined, label, opts), opts),
  {
    custom: sonnerToast.custom,
    success: (label: string, opts: CustomToastOptions = {}) =>
      sonnerToast.custom(render('success', label, opts), opts),
    error: (label: string, opts: CustomToastOptions = {}) =>
      sonnerToast.custom(render('error', label, opts), opts),
    warning: (label: string, opts: CustomToastOptions = {}) =>
      sonnerToast.custom(render('warning', label, opts), opts),
    info: (label: string, opts: CustomToastOptions = {}) =>
      sonnerToast.custom(render('info', label, opts), opts),
    loading: (label: string, opts: CustomToastOptions = {}) =>
      sonnerToast.custom(render('loading', label, opts), opts),
    dismiss: sonnerToast.dismiss,
    promise: sonnerToast.promise,
    getHistory: sonnerToast.getHistory,
    getToasts: sonnerToast.getToasts,
  }
);

export { CustomToaster, toast, Toaster };
export type { CustomToastOptions };

function ToastActions({
  actions,
  hidden = false,
  id,
  dismissible = true,
}: {
  actions: Actions | undefined;
  hidden?: boolean;
  id?: string | number;
  dismissible?: boolean;
}) {
  if (hidden) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 justify-between w-full">
      {dismissible && (
        <Button
          onClick={() =>
            id !== undefined ? sonnerToast.dismiss(id) : sonnerToast.dismiss()
          }
          variant="outline"
          size="sm"
        >
          Dismiss
        </Button>
      )}
      <div className="flex items-center gap-2">
        {actions?.secondary && (
          <Button
            onClick={actions.secondary.onClick}
            variant="outline"
            size="sm"
          >
            {actions.secondary.label}
          </Button>
        )}
        {actions?.primary && (
          <Button onClick={actions.primary.onClick} variant="default" size="sm">
            {actions.primary.label}
          </Button>
        )}
      </div>
    </div>
  );
}

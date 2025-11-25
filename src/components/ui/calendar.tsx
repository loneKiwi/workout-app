'use client';
import { timejs } from '@/lib/time';
import { cn } from '@/lib/utils';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from 'lucide-react';
import * as React from 'react';
import { DayButton, DayPicker, getDefaultClassNames } from 'react-day-picker';

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = 'label',
  buttonVariant = 'ghost',
  formatters,
  components,
  timezone,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>['variant'];
  timezone?: string;
}) {
  const defaultClassNames = getDefaultClassNames();
  const tz = React.useMemo(
    () =>
      timezone ??
      (timejs.tz && typeof timejs.tz.guess === 'function'
        ? timejs.tz.guess()
        : 'UTC'),
    [timezone]
  );

  const toLocalFromTzDate = React.useCallback(
    (date: Date) => {
      const inTz = timejs(date).tz(tz);
      return new Date(inTz.year(), inTz.month(), inTz.date());
    },
    [tz]
  );

  const fromLocalToTzDate = React.useCallback(
    (date: Date) => {
      const ymd = timejs(date).format('YYYY-MM-DD');
      return timejs.tz(ymd, tz).toDate();
    },
    [tz]
  );

  const { selected, onSelect, month, ...dayPickerProps } = props as any;

  const selectedForPicker = React.useMemo(() => {
    if (!selected) return selected;
    if (selected instanceof Date) return toLocalFromTzDate(selected);
    if (Array.isArray(selected))
      return selected.map((d) => (d ? toLocalFromTzDate(d) : d));
    if (
      selected &&
      typeof selected === 'object' &&
      ('from' in selected || 'to' in selected)
    ) {
      return {
        from: selected.from ? toLocalFromTzDate(selected.from) : undefined,
        to: selected.to ? toLocalFromTzDate(selected.to) : undefined,
      };
    }
    return selected;
  }, [selected, toLocalFromTzDate]);

  const handleSelect = React.useCallback(
    (date: any, selectedDay: any, activeModifiers: any, e: any) => {
      if (!onSelect) return;
      if (date instanceof Date) {
        onSelect(fromLocalToTzDate(date), selectedDay, activeModifiers, e);
        return;
      }
      if (Array.isArray(date)) {
        onSelect(
          date.map((d) => (d instanceof Date ? fromLocalToTzDate(d) : d)),
          selectedDay,
          activeModifiers,
          e
        );
        return;
      }
      if (
        date &&
        typeof date === 'object' &&
        ('from' in date || 'to' in date)
      ) {
        const mapped = {
          from:
            date.from instanceof Date
              ? fromLocalToTzDate(date.from)
              : undefined,
          to: date.to instanceof Date ? fromLocalToTzDate(date.to) : undefined,
        };
        onSelect(mapped, selectedDay, activeModifiers, e);
        return;
      }
      onSelect(date, selectedDay, activeModifiers, e);
    },
    [onSelect, fromLocalToTzDate]
  );

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        'bg-transparent group/calendar p-3 [--cell-size:--spacing(8)] [[data-slot=card-content]_&]:bg-transparent [[data-slot=popover-content]_&]:bg-transparent',
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className
      )}
      captionLayout={captionLayout}
      today={timejs().tz(tz).startOf('day').toDate()}
      formatters={{
        formatMonthDropdown: (date) => timejs(date).tz(tz).format('MMM'),
        formatYearDropdown: (date) => timejs(date).tz(tz).format('YYYY'),
        formatCaption: (date) => timejs(date).tz(tz).format('MMMM YYYY'),
        ...formatters,
      }}
      classNames={{
        root: cn('w-fit', defaultClassNames.root),
        months: cn(
          'flex gap-4 flex-col md:flex-row relative',
          defaultClassNames.months
        ),
        month: cn('flex flex-col w-full gap-4', defaultClassNames.month),
        nav: cn(
          'flex items-center gap-1 w-full absolute top-0 inset-x-0 justify-between',
          defaultClassNames.nav
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          'size-(--cell-size) aria-disabled:opacity-50 p-0 select-none',
          defaultClassNames.button_previous
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          'size-(--cell-size) aria-disabled:opacity-50 p-0 select-none',
          defaultClassNames.button_next
        ),
        month_caption: cn(
          'flex items-center justify-center h-(--cell-size) w-full px-(--cell-size)',
          defaultClassNames.month_caption
        ),
        dropdowns: cn(
          'w-full flex items-center text-sm font-medium justify-center h-(--cell-size) gap-1.5',
          defaultClassNames.dropdowns
        ),
        dropdown_root: cn(
          'relative has-focus:border-ring border border-input shadow-xs has-focus:ring-ring/50 has-focus:ring-[3px] rounded-md',
          defaultClassNames.dropdown_root
        ),
        dropdown: cn(
          'absolute bg-popover inset-0 opacity-0',
          defaultClassNames.dropdown
        ),
        caption_label: cn(
          'select-none font-medium',
          captionLayout === 'label'
            ? 'text-sm'
            : 'rounded-md pl-2 pr-1 flex items-center gap-1 text-sm h-8 [&>svg]:text-muted-foreground [&>svg]:size-3.5',
          defaultClassNames.caption_label
        ),
        table: 'w-full border-collapse',
        weekdays: cn('flex', defaultClassNames.weekdays),
        weekday: cn(
          'text-muted-foreground rounded-md flex-1 font-normal text-[0.8rem] select-none',
          defaultClassNames.weekday
        ),
        week: cn('flex w-full mt-2', defaultClassNames.week),
        week_number_header: cn(
          'select-none w-(--cell-size)',
          defaultClassNames.week_number_header
        ),
        week_number: cn(
          'text-[0.8rem] select-none text-muted-foreground',
          defaultClassNames.week_number
        ),
        day: cn(
          'relative w-full bg-transparent h-full p-0 text-center [&:first-child[data-selected=true]_button]:rounded-l-md [&:last-child[data-selected=true]_button]:rounded-r-md group/day aspect-square select-none',
          defaultClassNames.day
        ),
        range_start: cn(
          'rounded-l-md bg-accent',
          defaultClassNames.range_start
        ),
        range_middle: cn('rounded-none', defaultClassNames.range_middle),
        range_end: cn('rounded-r-md bg-accent', defaultClassNames.range_end),
        today: cn('', defaultClassNames.today),
        outside: cn(
          'text-muted-foreground aria-selected:text-muted-foreground',
          defaultClassNames.outside
        ),
        disabled: cn(
          'text-muted-foreground opacity-50',
          defaultClassNames.disabled
        ),
        hidden: cn('invisible', defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => {
          return (
            <div
              data-slot="calendar"
              ref={rootRef}
              className={cn(className)}
              {...props}
            />
          );
        },
        PreviousMonthButton: ({ className, ...props }) => {
          return (
            <Button
              variant="outline"
              className={cn(className, 'bg-transparent rounded-md')}
              {...props}
            />
          );
        },
        NextMonthButton: ({ className, ...props }) => {
          return (
            <Button
              variant="outline"
              className={cn(className, 'bg-transparent rounded-md')}
              {...props}
            />
          );
        },
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === 'left') {
            return (
              <ChevronLeftIcon className={cn('size-4', className)} {...props} />
            );
          }

          if (orientation === 'right') {
            return (
              <ChevronRightIcon
                className={cn('size-4', className)}
                {...props}
              />
            );
          }

          return (
            <ChevronDownIcon className={cn('size-4', className)} {...props} />
          );
        },
        DayButton: (dayButtonProps) => (
          <CalendarDayButton {...dayButtonProps} timezone={tz} />
        ),
        WeekNumber: ({ children, ...props }) => {
          return (
            <td {...props}>
              <div className="flex size-(--cell-size) items-center justify-center text-center">
                {children}
              </div>
            </td>
          );
        },
        ...components,
      }}
      {...dayPickerProps}
      selected={selectedForPicker}
      onSelect={handleSelect}
      month={month instanceof Date ? toLocalFromTzDate(month) : month}
    />
  );
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  timezone,
  ...props
}: React.ComponentProps<typeof DayButton> & { timezone: string }) {
  const defaultClassNames = getDefaultClassNames();

  const ref = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-today={modifiers.today}
      data-day={timejs(day.date).tz(timezone).format('YYYY-MM-DD')}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        'data-[today=true]:bg-blue-500/10 data-[today=true]:text-blue-500 data-[selected-single=true]:bg-primary bg-transparent backdrop-blur-none data-[selected-single=true]:text-primary-foreground data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground data-[today=true]:data-[selected-single=true]:bg-primary data-[today=true]:data-[selected-single=true]:text-primary-foreground data-[today=true]:data-[range-start=true]:bg-primary data-[today=true]:data-[range-start=true]:text-primary-foreground data-[today=true]:data-[range-end=true]:bg-primary data-[today=true]:data-[range-end=true]:text-primary-foreground group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-ring/50 flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-1 leading-none font-normal group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:ring-[3px] data-[range-end=true]:rounded-md data-[range-end=true]:rounded-r-md data-[range-middle=true]:rounded-none data-[range-start=true]:rounded-md data-[range-start=true]:rounded-l-md [&>span]:text-xs [&>span]:opacity-70',
        defaultClassNames.day,
        className
      )}
      {...props}
    />
  );
}

export { Calendar, CalendarDayButton };

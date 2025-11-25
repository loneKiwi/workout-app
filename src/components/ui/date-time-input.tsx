'use client';
import { timejs } from '@/lib/time';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Combobox, ComoboOption } from '@/components/ui/combobox';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ChevronsUpDown } from 'lucide-react';
import React from 'react';

export function DateTimeInput({
  value,
  onChange,
  disabled = false,
  timezone,
  format = 'ddd, MMM D, HH:mm',
  size = 'default',
  placeholder = 'Select date & time',
  selector,
  className,
}: {
  value: Date | undefined;
  onChange: (value: Date | undefined) => void;
  disabled?: boolean;
  timezone: string;
  format?: string;
  size?: 'default' | 'sm' | 'lg';
  placeholder?: string;
  selector?: React.ReactNode;
  className?: string;
}) {
  // Generate time options in 15-minute increments
  const timeOptions = React.useMemo<ComoboOption[]>(() => {
    const options: ComoboOption[] = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeValue = `${hour.toString().padStart(2, '0')}:${minute
          .toString()
          .padStart(2, '0')}`;
        const label = timejs().hour(hour).minute(minute).format('hh:mm A');
        options.push({
          value: timeValue,
          label: label,
          icon: null,
        });
      }
    }
    return options;
  }, []);

  const selectedTimeValue = React.useMemo(() => {
    if (!value) return undefined;
    const hours = timejs(value).tz(timezone).hour();
    const minutes = timejs(value).tz(timezone).minute();
    // Round to nearest 15 minutes
    const roundedMinutes = Math.round(minutes / 15) * 15;
    const finalHours = roundedMinutes === 60 ? hours + 1 : hours;
    const finalMinutes = roundedMinutes === 60 ? 0 : roundedMinutes;
    return `${finalHours.toString().padStart(2, '0')}:${finalMinutes
      .toString()
      .padStart(2, '0')}`;
  }, [value, timezone]);

  const handleTimeSelect = (timeValue: string) => {
    if (!timeValue) return;
    const [hours, minutes] = timeValue.split(':').map(Number);
    const newDate = timejs(value)
      .tz(timezone)
      .hour(hours)
      .minute(minutes)
      .second(0)
      .millisecond(0)
      .toDate();
    onChange(newDate);
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) {
      onChange(undefined);
      return;
    }
    // Preserve the time when changing the date
    if (value) {
      const newDate = timejs(date)
        .tz(timezone)
        .hour(timejs(value).tz(timezone).hour())
        .minute(timejs(value).tz(timezone).minute())
        .toDate();
      onChange(newDate);
    } else {
      // Set default time (00:00) when no value exists
      const newDate = timejs(date).tz(timezone).hour(0).minute(0).toDate();
      onChange(newDate);
    }
  };

  const label = React.useMemo(() => {
    if (!value) return placeholder;
    return timejs(value).tz(timezone).format(format);
  }, [value, timezone, format, placeholder]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        {selector ? (
          selector
        ) : (
          <Button
            variant="outline"
            disabled={disabled}
            className={cn(
              'justify-between px-2 font-normal',
              size === 'sm' && 'px-2 pl-2.5',
              size === 'default' && 'px-2 pl-2.5',
              size === 'lg' && 'px-3',
              className
            )}
            size={size}
          >
            {label}
            <ChevronsUpDown
              className={cn(
                'opacity-50 shrink-0 size-3.5',
                size === 'sm' && 'size-3',
                size === 'default' && 'size-3.5',
                size === 'lg' && 'size-4'
              )}
            />
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent
        className="p-0 shadow-none rounded-lg flex flex-col gap-0 overflow-hidden"
        align="center"
      >
        <div className="p-3 w-full flex flex-col gap-2">
          <Combobox
            options={timeOptions}
            value={selectedTimeValue}
            setValue={handleTimeSelect}
            disabled={disabled}
            placeholder="Select time"
            searchable={true}
            size={size}
          />
          <Calendar
            mode="single"
            selected={value}
            onSelect={handleDateSelect}
            className="w-full p-0"
            timezone={timezone}
          />
        </div>
        <div className="text-muted-foreground px-3 py-1 border-t bg-muted text-center text-xs">
          {timezone.replaceAll('_', ' ')}
        </div>
      </PopoverContent>
    </Popover>
  );
}

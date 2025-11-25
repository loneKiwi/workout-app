'use client';
import { cn } from '@/lib/utils';
import * as React from 'react';
import { useEffect } from 'react';
import { Input } from './input';

interface SuggestInputProps {
  placeholder?: string;
  suggestions: string[];
  value?: string;
  onValueChange: (value: string) => void;
  size?: 'default' | 'sm' | 'lg';
}

export function SuggestInput({
  placeholder = 'Type to search...',
  suggestions,
  value = '',
  onValueChange,
  size = 'default',
}: SuggestInputProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(-1);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Hook to detect clicks outside the component
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
        setSelectedIndex(-1);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  const filteredSuggestions = suggestions.filter((suggestion) =>
    suggestion.toLowerCase().includes(value.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredSuggestions.length]);

  const handleSelect = (selectedValue: string) => {
    onValueChange(selectedValue);
    setOpen(false);
    setSelectedIndex(0);
    inputRef.current?.focus();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    // setInputValue(newValue);
    onValueChange?.(newValue);

    const filtered = suggestions.filter((suggestion) =>
      suggestion.toLowerCase().includes(newValue.toLowerCase())
    );

    if (filtered.length === 0) {
      setOpen(false);
    } else if (!open) {
      setOpen(true);
    }
  };

  const handleInputFocus = () => {
    if (filteredSuggestions.length > 0) {
      setOpen(true);
    }
  };

  const handleInputBlur = () => {
    setSelectedIndex(0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < filteredSuggestions.length) {
          handleSelect(filteredSuggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const onClick = (new_value: string) => {
    onValueChange(new_value);
    setOpen(false);
    setSelectedIndex(0);
    inputRef.current?.blur();
  };

  return (
    <div
      ref={containerRef}
      className="relative gap-0 overflow-hidden border-input border rounded-lg focus-within:ring-0 focus-within:ring-ring"
    >
      <Input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        onKeyDown={handleKeyDown}
        className={cn(
          'rounded-t-lg outline-none ring-0 focus-visible:ring-0 border-none bg-transparent rounded-b-none w-full justify-start'
        )}
        size={size}
      />
      {open && filteredSuggestions.length > 0 && (
        <div className="overflow-y-scroll border-t p-1 border-input bg-transparent max-h-40 rounded-b-lg">
          <span className="text-xs font-semibold text-muted-foreground px-2">
            Suggestions
          </span>
          {filteredSuggestions.map((suggestion, index) => (
            <div
              key={`${suggestion}-${index}`}
              onClick={() => onClick(suggestion)}
              className={cn(
                'cursor-pointer px-2 h-8 flex transition-all rounded-md duration-100 items-center text-muted-foreground text-sm hover:bg-accent ',
                index === selectedIndex && 'bg-accent text-foreground'
              )}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

// Days of week labels (0 = Sunday, 6 = Saturday per RFC 5545)
const DAYS = [
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
];

/**
 * DaySelector - Toggle group for selecting days of the week
 * @param {number[]} value - Array of selected day values (0-6)
 * @param {function} onChange - Callback when selection changes
 * @param {string} className - Additional CSS classes
 */
export default function DaySelector({ value = [], onChange, className }) {
  const handleToggle = (day) => {
    const isSelected = value.includes(day);
    if (isSelected) {
      // Remove day from selection
      onChange(value.filter((d) => d !== day));
    } else {
      // Add day to selection and sort
      const newValue = [...value, day].sort((a, b) => a - b);
      onChange(newValue);
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      <Label>Days of Week</Label>
      <div className="flex gap-1 flex-wrap">
        {DAYS.map((day) => {
          const isSelected = value.includes(day.value);
          return (
            <Button
              key={day.value}
              type="button"
              variant={isSelected ? 'default' : 'outline'}
              size="sm"
              className={cn(
                'min-w-[48px]',
                isSelected && 'bg-primary text-primary-foreground'
              )}
              onClick={() => handleToggle(day.value)}
            >
              {day.label}
            </Button>
          );
        })}
      </div>
      {value.length === 0 && (
        <p className="text-xs text-muted-foreground">
          Select at least one day
        </p>
      )}
    </div>
  );
}

/**
 * Format day numbers to readable string
 * @param {number[]} days - Array of day values (0-6)
 * @returns {string} - Formatted string like "Mon, Wed, Fri"
 */
export function formatDays(days) {
  if (!days || days.length === 0) return '';
  return days
    .sort((a, b) => a - b)
    .map((d) => DAYS.find((day) => day.value === d)?.label || '')
    .filter(Boolean)
    .join(', ');
}

'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const DURATION_PRESETS = [30, 45, 60, 90];

/**
 * DurationSelector - Duration input with preset chips and custom input
 * @param {number} value - Current duration in minutes
 * @param {function} onChange - Callback when duration changes
 */
export default function DurationSelector({ value, onChange }) {
  const handlePresetClick = (preset) => {
    onChange(preset);
  };

  const handleInputChange = (e) => {
    const parsed = parseInt(e.target.value, 10);
    if (!isNaN(parsed) && parsed > 0) {
      onChange(parsed);
    }
  };

  return (
    <div className="space-y-2">
      <Label>Duration (minutes)</Label>
      <div className="flex gap-2 flex-wrap">
        {DURATION_PRESETS.map((preset) => (
          <Button
            key={preset}
            type="button"
            variant={value === preset ? 'default' : 'outline'}
            size="sm"
            onClick={() => handlePresetClick(preset)}
          >
            {preset} min
          </Button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          min={15}
          max={180}
          step={15}
          value={value || ''}
          onChange={handleInputChange}
          className="w-24"
          placeholder="60"
        />
        <span className="text-sm text-muted-foreground">minutes</span>
      </div>
    </div>
  );
}

import React from 'react';
import { cn } from '@/lib/utils';

const Checkbox = React.forwardRef(({ className, checked, onCheckedChange, ...props }, ref) => (
  <input
    type="checkbox"
    ref={ref}
    checked={checked}
    onChange={(e) => onCheckedChange?.(e.target.checked)}
    className={cn(
      'h-4 w-4 rounded border border-input accent-primary cursor-pointer',
      className
    )}
    {...props}
  />
));
Checkbox.displayName = 'Checkbox';

export { Checkbox };

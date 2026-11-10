'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';

// Implementación propia: evita un bug del minificador con el paquete
// @radix-ui/react-progress (plantillas con backticks rotas en el build).
interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number | null;
  max?: number;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, max = 100, ...props }, ref) => {
    const indicador =
      value === null || value === undefined
        ? 0
        : Math.min(Math.max((value / max) * 100, 0), 100);
    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuemax={max}
        aria-valuemin={0}
        aria-valuenow={value ?? undefined}
        className={cn(
          'relative h-4 w-full overflow-hidden rounded-full bg-secondary',
          className
        )}
        {...props}
      >
        <div
          className="h-full flex-1 bg-primary transition-all"
          style={{ width: `${indicador}%` }}
        />
      </div>
    );
  }
);
Progress.displayName = 'Progress';

export { Progress };

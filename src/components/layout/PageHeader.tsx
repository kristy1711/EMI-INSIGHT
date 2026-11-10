'use client';

import type { ReactNode } from 'react';

export function PageHeader({
  titulo,
  subtitulo,
  acciones,
}: {
  titulo: string;
  subtitulo?: string;
  acciones?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy md:text-3xl">
          {titulo}
        </h1>
        {subtitulo && (
          <p className="mt-1.5 text-sm text-muted-foreground md:text-base">
            {subtitulo}
          </p>
        )}
      </div>
      {acciones && <div className="flex shrink-0 gap-2">{acciones}</div>}
    </div>
  );
}

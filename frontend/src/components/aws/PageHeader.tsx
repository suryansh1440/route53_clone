'use client';

import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  infoBanner?: React.ReactNode;
}

export function PageHeader({ title, description, actions, infoBanner }: PageHeaderProps) {
  return (
    <div className="bg-white border border-[#7d8998] rounded-xl p-6 shadow-2xs">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#000716] tracking-tight">{title}</h1>
          {description && (
            <p className="mt-1 text-sm text-[#5f6b7a] w-full leading-relaxed">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
      </div>

      {infoBanner && <div className="mt-4">{infoBanner}</div>}
    </div>
  );
}

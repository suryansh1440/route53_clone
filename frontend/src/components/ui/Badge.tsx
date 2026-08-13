'use client';

import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'green' | 'blue' | 'gray' | 'red' | 'yellow';
}

export function Badge({ children, variant = 'gray' }: BadgeProps) {
  const styles = {
    green: 'bg-[#f1fdf1] text-[#037f0c] border-[#7dd87d]',
    blue: 'bg-[#f2f8fd] text-[#0972d3] border-[#70b0eb]',
    gray: 'bg-[#f2f3f3] text-[#5f6b7a] border-[#d5dbdb]',
    red: 'bg-[#fdf2f2] text-[#d91515] border-[#f59e9e]',
    yellow: 'bg-[#fffbeb] text-[#d97706] border-[#fcd34d]',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${styles[variant]}`}
    >
      {children}
    </span>
  );
}

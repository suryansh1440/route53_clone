'use client';

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'normal' | 'link' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export function Button({
  variant = 'normal',
  size = 'md',
  icon,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const variantStyles = {
    primary:
      'bg-[#0972d3] hover:bg-[#033160] text-white focus:ring-[#0972d3] border border-transparent shadow-sm',
    normal:
      'bg-white hover:bg-[#f2f3f3] text-[#000716] border border-[#7d8998] hover:border-[#000716] focus:ring-[#0972d3]',
    link: 'bg-transparent text-[#0972d3] hover:underline hover:text-[#033160] p-0 border-none focus:ring-0',
    danger:
      'bg-[#d91515] hover:bg-[#a91010] text-white focus:ring-[#d91515] border border-transparent shadow-sm',
  };

  const sizeStyles = {
    sm: 'px-2.5 py-1 text-xs gap-1.5',
    md: 'px-3.5 py-1.5 text-xs gap-2',
    lg: 'px-4 py-2 text-sm gap-2',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${
        variant !== 'link' ? sizeStyles[size] : ''
      } ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span className="inline-flex items-center justify-center gap-2">{children}</span>
    </button>
  );
}

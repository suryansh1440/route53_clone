'use client';

import React from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  helperText?: string;
  error?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, helperText, error, className = '', id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="flex flex-col gap-1 w-full max-w-2xl text-xs">
        {label && (
          <label htmlFor={selectId} className="font-semibold text-[#000716]">
            {label}
            {props.required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}

        <select
          id={selectId}
          ref={ref}
          className={`w-full px-3 py-1.5 bg-white border rounded text-[#000716] text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-[#0972d3] focus:border-[#0972d3] disabled:bg-[#f2f3f3] ${
            error ? 'border-red-500' : 'border-[#7d8998]'
          } ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {error ? (
          <p className="text-xs text-red-600 font-medium">{error}</p>
        ) : helperText ? (
          <p className="text-[11px] text-[#5f6b7a]">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = 'Select';

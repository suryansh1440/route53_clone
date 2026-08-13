'use client';

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, helperText, error, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="flex flex-col gap-1 w-full max-w-2xl text-xs">
        {label && (
          <label htmlFor={inputId} className="font-semibold text-[#000716]">
            {label}
            {props.required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}

        <input
          id={inputId}
          ref={ref}
          className={`w-full px-3.5 py-2 bg-white border rounded-md text-[#000716] text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-[#0972d3] focus:border-[#0972d3] disabled:bg-[#f2f3f3] disabled:text-gray-500 placeholder:italic placeholder:text-gray-400 ${
            error
              ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
              : 'border-[#7d8998]'
          } ${className}`}
          {...props}
        />

        {error ? (
          <p className="text-xs text-red-600 font-medium">{error}</p>
        ) : helperText ? (
          <p className="text-[11px] text-[#5f6b7a]">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';

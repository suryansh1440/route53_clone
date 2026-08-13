'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Menu, Info } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  sidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

export function Breadcrumbs({ items, sidebarCollapsed = false, onToggleSidebar }: BreadcrumbsProps) {
  return (
    <div className="fixed top-[45px] left-0 right-0 z-40 flex items-center justify-between h-11 px-4 bg-white border-b border-[#e9ebed] text-sm select-none">
      <div className="flex items-center gap-3">
        {/* Burger Button: Blue when sidebar is open, white/border when collapsed */}
        <button
          onClick={onToggleSidebar}
          className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors shadow-xs ${
            !sidebarCollapsed
              ? 'bg-[#0972d3] text-white hover:bg-[#033160]'
              : 'bg-white border border-[#7d8998] text-[#000716] hover:bg-[#f2f3f3]'
          }`}
          title={sidebarCollapsed ? 'Expand Navigation' : 'Collapse Navigation'}
        >
          <Menu className="w-3.5 h-3.5" />
        </button>

        {/* Breadcrumb Trail */}
        <nav aria-label="Breadcrumb" className="flex items-center">
          <ol className="flex items-center flex-wrap gap-1">
            <li>
              <Link
                href="/route53/hosted-zones"
                className="text-[#0972d3] hover:underline font-medium"
              >
                Route 53
              </Link>
            </li>

            {items.map((item, idx) => {
              const isLast = idx === items.length - 1;

              return (
                <li key={idx} className="flex items-center gap-1">
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  {item.href && !isLast ? (
                    <Link
                      href={item.href}
                      className="text-[#0972d3] hover:underline font-medium"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span className={`font-semibold ${isLast ? 'text-[#000716]' : 'text-[#0972d3]'}`}>
                      {item.label}
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      </div>

      {/* Info Icon on Far Right */}
      <button className="text-gray-500 hover:text-gray-800 p-1 rounded hover:bg-gray-100" title="Information Panel">
        <Info className="w-4 h-4" />
      </button>
    </div>
  );
}

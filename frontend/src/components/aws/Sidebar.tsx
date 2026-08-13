'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

interface SidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({ collapsed = false, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();

  const [sectionsOpen, setSectionsOpen] = useState<{ [key: string]: boolean }>({
    globalResolver: true,
    vpcResolver: true,
    domains: true,
    ipRouting: true,
  });

  if (collapsed) {
    return null;
  }

  const toggleSection = (key: string) => {
    setSectionsOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const topItems = [
    { name: 'Dashboard', href: '/route53/dashboard' },
    { name: 'Hosted zones', href: '/route53/hosted-zones' },
    { name: 'Health checks', href: '/route53/health-checks' },
    { name: 'Profiles', href: '/route53/profiles' },
  ];

  const globalResolverItems = [
    { name: 'Global resolvers', href: '/route53/resolver', isNew: true },
    { name: 'Shared DNS views', href: '/route53/resolver', isNew: true },
  ];

  const vpcResolverItems = [
    { name: 'VPCs', href: '/route53/resolver' },
    { name: 'Inbound endpoints', href: '/route53/resolver' },
    { name: 'Outbound endpoints', href: '/route53/resolver' },
    { name: 'Rules', href: '/route53/resolver' },
    { name: 'Query logging', href: '/route53/resolver' },
    { name: 'Outposts', href: '/route53/resolver' },
  ];

  const domainsItems = [
    { name: 'Registered domains', href: '/route53/resolver' },
    { name: 'Requests', href: '/route53/resolver' },
  ];

  return (
    <aside
      className={`fixed top-[89px] bottom-7 left-0 bg-white border-r border-[#e9ebed] z-30 transition-all duration-150 flex flex-col select-none text-sm ${
        collapsed ? 'w-12' : 'w-56'
      }`}
    >
      {/* Sidebar Top Title + Collapse Button */}
      <div className="px-4 py-3 border-b border-[#e9ebed] flex items-center justify-between min-h-[44px]">
        {!collapsed && (
          <h2 className="font-bold text-base text-[#000716] tracking-tight">
            Route 53
          </h2>
        )}
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="p-1 rounded hover:bg-[#f2f3f3] text-[#5f6b7a] hover:text-[#000716] transition-colors ml-auto"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Navigation Menu List */}
      <div className="flex-1 overflow-y-auto py-2 px-2">
        {/* Top Direct Nav Items */}
        <ul className="space-y-0.5 mb-4">
          {topItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/route53/dashboard' && pathname.startsWith(item.href));

            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`block px-3 py-1.5 rounded transition-colors text-sm ${
                    isActive
                      ? 'font-bold text-[#0972d3] bg-[#f2f8fd]'
                      : 'text-[#5f6b7a] hover:text-[#0972d3] hover:bg-[#f2f3f3]'
                  }`}
                >
                  {!collapsed ? item.name : item.name.charAt(0)}
                </Link>
              </li>
            );
          })}
        </ul>

        {!collapsed && (
          <>
            {/* Section 1: Global Resolver */}
            <div className="mb-3">
              <button
                onClick={() => toggleSection('globalResolver')}
                className="w-full flex items-center gap-1.5 px-2 py-1 text-[14.5px] font-bold text-[#000716] hover:text-[#0972d3] text-left"
              >
                <ChevronDown
                  className={`w-3.5 h-3.5 text-gray-500 transition-transform ${
                    sectionsOpen.globalResolver ? '' : '-rotate-90'
                  }`}
                />
                <span>Global Resolver</span>
              </button>

              {sectionsOpen.globalResolver && (
                <ul className="mt-0.5 space-y-0.5 pl-5">
                  {globalResolverItems.map((sub) => (
                    <li key={sub.name}>
                      <Link
                        href={sub.href}
                        className="flex items-center gap-1.5 py-1 px-1.5 rounded text-[#5f6b7a] hover:text-[#0972d3] hover:bg-[#f2f3f3]"
                      >
                        <span>{sub.name}</span>
                        {sub.isNew && (
                          <span className="text-[10px] text-[#0972d3] border-b border-dotted border-[#0972d3]">
                            New
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Section 2: VPC Resolver */}
            <div className="mb-3">
              <button
                onClick={() => toggleSection('vpcResolver')}
                className="w-full flex items-center gap-1.5 px-2 py-1 text-[14.5px] font-bold text-[#000716] hover:text-[#0972d3] text-left"
              >
                <ChevronDown
                  className={`w-3.5 h-3.5 text-gray-500 transition-transform ${
                    sectionsOpen.vpcResolver ? '' : '-rotate-90'
                  }`}
                />
                <span>VPC Resolver</span>
              </button>

              {sectionsOpen.vpcResolver && (
                <ul className="mt-0.5 space-y-0.5 pl-5">
                  {vpcResolverItems.map((sub) => (
                    <li key={sub.name}>
                      <Link
                        href={sub.href}
                        className="block py-1 px-1.5 rounded text-[#5f6b7a] hover:text-[#0972d3] hover:bg-[#f2f3f3]"
                      >
                        {sub.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Section 3: Domains */}
            <div className="mb-3">
              <button
                onClick={() => toggleSection('domains')}
                className="w-full flex items-center gap-1.5 px-2 py-1 text-[14.5px] font-bold text-[#000716] hover:text-[#0972d3] text-left"
              >
                <ChevronDown
                  className={`w-3.5 h-3.5 text-gray-500 transition-transform ${
                    sectionsOpen.domains ? '' : '-rotate-90'
                  }`}
                />
                <span>Domains</span>
              </button>

              {sectionsOpen.domains && (
                <ul className="mt-0.5 space-y-0.5 pl-5">
                  {domainsItems.map((sub) => (
                    <li key={sub.name}>
                      <Link
                        href={sub.href}
                        className="block py-1 px-1.5 rounded text-[#5f6b7a] hover:text-[#0972d3] hover:bg-[#f2f3f3]"
                      >
                        {sub.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Section 4: IP-based routing */}
            <div className="mb-3">
              <button
                onClick={() => toggleSection('ipRouting')}
                className="w-full flex items-center gap-1.5 px-2 py-1 text-[14.5px] font-bold text-[#000716] hover:text-[#0972d3] text-left"
              >
                <ChevronDown
                  className={`w-3.5 h-3.5 text-gray-500 transition-transform ${
                    sectionsOpen.ipRouting ? '' : '-rotate-90'
                  }`}
                />
                <span>IP-based routing</span>
              </button>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}

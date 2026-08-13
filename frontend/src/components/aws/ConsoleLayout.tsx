'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { AwsHeader } from './AwsHeader';
import { Sidebar } from './Sidebar';
import { Breadcrumbs, BreadcrumbItem } from './Breadcrumbs';

import { useKeyboardShortcuts, KeyboardShortcutsModal } from './KeyboardShortcuts';

interface ConsoleLayoutProps {
  children: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
}

export function ConsoleLayout({ children, breadcrumbs = [] }: ConsoleLayoutProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { shortcutsModalOpen, closeShortcutsModal, openShortcutsModal } = useKeyboardShortcuts();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f2f3f3] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#0972d3] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-[#5f6b7a] font-medium">Loading AWS Console...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      {/* Top Dark Header */}
      <AwsHeader />

      {/* Sub-header Breadcrumb Bar (Full Width, starts from left) */}
      <Breadcrumbs
        items={breadcrumbs}
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Body Container */}
      <div className="flex flex-1 pt-[98px]">
        {/* Left Sidebar (Starts below breadcrumb bar) */}
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Main Content Viewport */}
        <main
          className={`flex-1 transition-all duration-150 flex flex-col min-w-0 pb-10 ${
            sidebarCollapsed ? 'ml-0' : 'ml-56'
          }`}
        >
          {/* Page Content Container */}
          <div className="flex-1 p-6">{children}</div>
        </main>
      </div>

      {/* Console Bottom Status Footer (matches screenshot footer bar!) */}
      <footer className="h-7 bg-[#162232] text-gray-300 border-t border-[#232f3e] px-4 flex items-center justify-between text-[11px] select-none fixed bottom-0 left-0 right-0 z-50">
        <div className="flex items-center gap-4">
          <button className="hover:text-white flex items-center gap-1 font-mono">
            <span>&gt;_ CloudShell</span>
          </button>
          <button className="hover:text-white">Agent Toolkit for AWS</button>
          <button onClick={openShortcutsModal} className="hover:text-white flex items-center gap-1">
            <span>Shortcuts [?]</span>
          </button>
          <button className="hover:text-white">Console Mobile App</button>
        </div>
        <div className="flex items-center gap-4 text-gray-400">
          <span>© 2026, Amazon Web Services, Inc. or its affiliates.</span>
          <a href="#" className="hover:text-white">Privacy</a>
          <a href="#" className="hover:text-white">Terms</a>
          <a href="#" className="hover:text-white">Cookie preferences</a>
        </div>
      </footer>

      {/* Global Keyboard Shortcuts Help Modal */}
      <KeyboardShortcutsModal isOpen={shortcutsModalOpen} onClose={closeShortcutsModal} />
    </div>
  );
}

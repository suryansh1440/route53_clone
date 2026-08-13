'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useTheme } from '@/lib/theme';
import {
  Search,
  Bell,
  HelpCircle,
  Settings,
  Grid,
  Sparkles,
  LogOut,
  ChevronDown,
  ExternalLink,
  Sun,
  Moon,
} from 'lucide-react';

export function AwsHeader() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [regionDropdownOpen, setRegionDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const username = user?.name || 'surya1440';
  const accountId = '317286499474';

  return (
    <header className="bg-[#0f1b2a] text-white h-[45px] flex items-center justify-between px-3 fixed top-0 left-0 right-0 z-50 select-none text-xs border-b border-[#232f3e]">
      {/* Left Section: AWS Brand + Q Icon + Apps Grid + Search */}
      <div className="flex items-center gap-3">
        {/* Header Logo */}
        <Link href="/route53/hosted-zones" className="flex items-center px-1.5 py-1 hover:opacity-90 transition-opacity">
          <img
            src="/image.png"
            alt="AWS Logo"
            className="h-6 w-auto object-contain brightness-0 invert drop-shadow-sm"
          />
        </Link>

        {/* Q Icon & Apps Grid */}
        <div className="flex items-center gap-2 text-gray-300 ml-1">
          <button className="p-1 hover:bg-[#232f3e] rounded text-purple-400" title="Amazon Q">
            <Sparkles className="w-4 h-4" />
          </button>
          <button className="p-1 hover:bg-[#232f3e] rounded text-gray-300" title="Services">
            <Grid className="w-4 h-4" />
          </button>
        </div>

        {/* Global Search Bar with [Alt+S] */}
        <div className="relative hidden md:block w-96 ml-1">
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-gray-400">
            <Search className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            placeholder="Search"
            className="w-full bg-[#162232] text-gray-100 text-xs pl-8 pr-16 py-1 rounded border border-[#344455] focus:outline-none focus:border-[#ff9900] placeholder-gray-400"
          />
          <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
            <span className="text-[10px] text-gray-400 bg-[#232f3e] px-1.5 py-0.5 rounded border border-[#344455]">
              [Alt+S]
            </span>
          </div>
        </div>
      </div>

      {/* Right Section: Utilities + Region + Account dropdown */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Utility Action Icons */}
        <div className="flex items-center gap-0.5 text-gray-300">
          <button
            onClick={toggleTheme}
            className="p-1.5 hover:bg-[#232f3e] rounded transition-colors text-amber-400"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          >
            {theme === 'light' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
          </button>
          <button className="p-1.5 hover:bg-[#232f3e] rounded" title="CloudShell / Utilities">
            <span className="font-mono text-xs font-bold text-gray-300">&gt;_</span>
          </button>
          <button className="p-1.5 hover:bg-[#232f3e] rounded" title="Notifications">
            <Bell className="w-3.5 h-3.5" />
          </button>
          <button className="p-1.5 hover:bg-[#232f3e] rounded" title="Documentation & Help">
            <HelpCircle className="w-3.5 h-3.5" />
          </button>
          <button className="p-1.5 hover:bg-[#232f3e] rounded" title="Console Settings">
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="h-4 w-[1px] bg-[#344455] mx-1" />

        {/* Region Selector */}
        <div className="relative">
          <button
            onClick={() => {
              setRegionDropdownOpen(!regionDropdownOpen);
              setUserDropdownOpen(false);
            }}
            className="flex items-center gap-1 px-2 py-1 rounded hover:bg-[#232f3e] text-gray-200 transition-colors font-medium text-[11px]"
          >
            <span>Global</span>
            <ChevronDown className="w-3 h-3 text-gray-400" />
          </button>

          {regionDropdownOpen && (
            <div className="absolute right-0 mt-1 w-56 bg-[#162232] border border-[#344455] rounded shadow-lg z-50 text-gray-200 py-1 text-xs">
              <div className="px-3 py-1.5 font-bold text-gray-400 uppercase tracking-wider border-b border-[#344455]">
                Global Service
              </div>
              <div className="px-3 py-2 text-gray-300">
                Route 53 does not require region selection. It is a global DNS network.
              </div>
            </div>
          )}
        </div>

        {/* Account Menu Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setUserDropdownOpen(!userDropdownOpen);
              setRegionDropdownOpen(false);
            }}
            className="flex flex-col items-end px-2 py-0.5 rounded hover:bg-[#232f3e] text-gray-200 transition-colors text-left"
          >
            <div className="flex items-center gap-1 text-[11px] font-semibold">
              <span>{username} ({accountId})</span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </div>
            <span className="text-[10px] text-gray-400 -mt-0.5">{username}</span>
          </button>

          {userDropdownOpen && (
            <div className="absolute right-0 mt-1 w-64 bg-[#ffffff] border border-gray-300 text-gray-900 rounded shadow-xl z-50 py-1 text-xs">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <p className="font-bold text-gray-900">{username}</p>
                <p className="text-gray-500 font-mono mt-0.5">{user?.email || 'admin@example.com'}</p>
                <p className="text-[11px] text-gray-400 mt-1 font-mono">Account ID: {accountId}</p>
              </div>

              <div className="py-1">
                <a
                  href="https://aws.amazon.com/route53/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  <span>AWS Documentation</span>
                  <ExternalLink className="w-3 h-3 text-gray-400" />
                </a>
              </div>

              <div className="border-t border-gray-200 pt-1">
                <button
                  onClick={handleLogout}
                  className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-red-600 hover:bg-red-50 font-semibold"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

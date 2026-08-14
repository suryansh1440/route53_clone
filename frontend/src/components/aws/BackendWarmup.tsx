'use client';

import React, { useEffect, useState } from 'react';
import { Server, RefreshCw, Cpu, CheckCircle, AlertCircle } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export function BackendWarmup({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState<boolean>(false);
  const [slowLoad, setSlowLoad] = useState<boolean>(false);
  const [elapsed, setElapsed] = useState<number>(0);
  const [errorCount, setErrorCount] = useState<number>(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    let interval: NodeJS.Timeout;

    // Show warming up UI if backend health check takes > 1.2s
    const slowTimer = setTimeout(() => {
      setSlowLoad(true);
    }, 1200);

    const checkHealth = async () => {
      try {
        const primaryUrl = '/api/health';
        const fallbackUrl = API_BASE ? `${API_BASE.replace(/\/$/, '')}/api/health` : '/api/health';
        
        let res = await fetch(primaryUrl, { credentials: 'include' }).catch(() => null);
        if (!res || !res.ok) {
          res = await fetch(fallbackUrl, { credentials: 'include' }).catch(() => null);
        }

        if (res && res.ok) {
          clearTimeout(slowTimer);
          setReady(true);
        } else {
          throw new Error('Not ready');
        }
      } catch (err) {
        setErrorCount((prev) => prev + 1);
        timer = setTimeout(checkHealth, 2000);
      }
    };

    checkHealth();

    interval = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);

    return () => {
      clearTimeout(slowTimer);
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  if (!ready && slowLoad) {
    return (
      <div className="min-h-screen bg-[#0f1b2a] text-white flex flex-col items-center justify-center p-6 select-none font-sans">
        <div className="w-full max-w-md bg-[#192534] border border-[#2b3a4e] rounded-2xl shadow-2xl p-8 flex flex-col items-center text-center gap-6 animate-fade-in">
          {/* AWS Logo Header */}
          <div className="flex items-center gap-2">
            <img src="/image.png" alt="AWS Logo" className="h-7 w-auto object-contain brightness-0 invert" />
          </div>

          {/* Animated Server Pulse */}
          <div className="relative flex items-center justify-center my-2">
            <div className="w-20 h-20 bg-[#0972d3]/20 rounded-full animate-ping absolute" />
            <div className="w-16 h-16 bg-[#162232] border-2 border-[#0972d3] rounded-full flex items-center justify-center text-[#0972d3] shadow-lg relative z-10">
              <Server className="w-8 h-8 animate-bounce" />
            </div>
          </div>

          {/* Status Details */}
          <div className="flex flex-col gap-2">
            <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-full text-xs font-semibold">
              <Cpu className="w-3.5 h-3.5" />
              <span>Render Free Tier Server Warmup</span>
            </div>

            <h2 className="text-xl font-extrabold tracking-tight text-white mt-1">
              Waking Up Backend Server...
            </h2>

            <p className="text-xs text-gray-300 leading-relaxed max-w-sm">
              Render free instance spins down after 15 minutes of inactivity. Please wait a few seconds while the FastAPI backend initializes.
            </p>
          </div>

          {/* Live Timer Progress */}
          <div className="w-full bg-[#15202e] border border-[#2b3a4e] p-4 rounded-xl flex flex-col gap-2.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-gray-400 flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#0972d3]" />
                Initializing FastAPI + SQLite...
              </span>
              <span className="text-amber-400 font-bold">{elapsed}s</span>
            </div>

            <div className="w-full bg-[#243346] h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#0972d3] h-full transition-all duration-500 rounded-full animate-pulse"
                style={{ width: `${Math.min(100, (elapsed / 30) * 100)}%` }}
              />
            </div>
          </div>

          <div className="text-[11px] text-gray-400 flex items-center gap-1">
            <span>Website will automatically open as soon as server responds.</span>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

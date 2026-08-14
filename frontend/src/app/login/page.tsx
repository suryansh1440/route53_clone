'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ApiError } from '@/lib/api';
import Link from 'next/link';
import { Lock, ShieldCheck, Key, User, CheckCircle2, Globe, Server, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const { login, user } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('admin123');
  const [userType, setUserType] = useState<'root' | 'iam'>('root');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      router.push('/route53/hosted-zones');
    }
  }, [user, router]);

  if (user) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ email, password });
      router.push('/route53/hosted-zones');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to log in. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('admin@example.com');
    setPassword('admin123');
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#f2f3f3] dark:bg-[#0f1b2a] flex flex-col justify-between font-sans text-xs transition-colors">
      {/* AWS Console Header */}
      <header className="bg-[#0f1b2a] text-white py-3 px-6 flex items-center justify-between border-b border-[#232f3e] shadow-xs">
        <div className="flex items-center gap-3">
          <img src="/image.png" alt="AWS Logo" className="h-6 w-auto object-contain brightness-0 invert" />
          <div className="h-4 w-[1px] bg-[#344455]" />
          <span className="font-semibold text-sm tracking-tight text-gray-200">
            Sign In — AWS Route 53 Management Console
          </span>
        </div>

        <div className="text-xs text-gray-400 font-mono hidden sm:block">
          Region: <span className="text-amber-400 font-bold">Global (DNS)</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 py-8">
        <div className="w-full max-w-md flex flex-col gap-5">
          {/* Main Login Card */}
          <div className="bg-white dark:bg-[#192534] border border-[#7d8998] dark:border-[#2b3a4e] rounded-xl shadow-xl p-8 transition-all">
            {/* Header Title */}
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-12 h-12 bg-[#ff9900]/10 rounded-full flex items-center justify-center text-[#ff9900] mb-3 shadow-inner">
                <Lock className="w-6 h-6" />
              </div>
              <h1 className="text-xl font-bold text-[#000716] dark:text-white">
                Sign in as Root User
              </h1>
              <p className="text-xs text-[#5f6b7a] dark:text-gray-400 mt-1">
                Access your global DNS Hosted Zones & Records
              </p>
            </div>

            {/* Root / IAM Selector Tabs */}
            <div className="grid grid-cols-2 gap-1 bg-[#fafafa] dark:bg-[#15202e] p-1 rounded-lg border border-[#e9ebed] dark:border-[#2b3a4e] mb-6 text-center font-semibold">
              <button
                type="button"
                onClick={() => setUserType('root')}
                className={`py-2 rounded-md transition-all flex items-center justify-center gap-1.5 ${
                  userType === 'root'
                    ? 'bg-white dark:bg-[#192534] text-[#000716] dark:text-white shadow-xs'
                    : 'text-[#5f6b7a] hover:text-[#000716]'
                }`}
              >
                <User className="w-3.5 h-3.5 text-[#0972d3]" />
                <span>Root user</span>
              </button>

              <button
                type="button"
                onClick={() => setUserType('iam')}
                className={`py-2 rounded-md transition-all flex items-center justify-center gap-1.5 ${
                  userType === 'iam'
                    ? 'bg-white dark:bg-[#192534] text-[#000716] dark:text-white shadow-xs'
                    : 'text-[#5f6b7a] hover:text-[#000716]'
                }`}
              >
                <Key className="w-3.5 h-3.5 text-purple-600" />
                <span>IAM user</span>
              </button>
            </div>

            {/* Error Notification Banner */}
            {error && (
              <div className="mb-5 p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 rounded-lg text-xs text-red-700 dark:text-red-400 font-medium flex items-start gap-2.5 animate-shake">
                <span className="shrink-0 font-bold bg-red-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]">!</span>
                <span>{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                label="Root user email address"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <div className="mt-3">
                <Button
                  variant="primary"
                  type="submit"
                  className="w-full justify-center py-2.5 text-sm bg-[#ff9900] hover:bg-[#ec7211] active:bg-[#dd6b10] text-[#000716] font-bold border-none shadow-md transition-all rounded-lg"
                  disabled={loading}
                >
                  <span className="flex items-center justify-center gap-2">
                    <span>{loading ? 'Authenticating...' : 'Sign in'}</span>
                    {!loading && <ArrowRight className="w-4 h-4 shrink-0 stroke-[2.5]" />}
                  </span>
                </Button>
              </div>
            </form>

            {/* Quick Demo Credentials Box */}
            <div className="mt-6 pt-5 border-t border-[#e9ebed] dark:border-[#2b3a4e] bg-[#fafafa] dark:bg-[#15202e] p-4 rounded-xl text-xs text-[#5f6b7a] dark:text-gray-300 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-[#000716] dark:text-white">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Demo Account Credentials</span>
                </div>
                <button
                  type="button"
                  onClick={handleFillDemo}
                  className="px-2.5 py-1 bg-[#0972d3] text-white font-semibold rounded text-[11px] hover:bg-[#033160] transition-colors"
                >
                  Auto-fill demo
                </button>
              </div>

              <div className="font-mono text-[11px] bg-white dark:bg-[#192534] p-3 rounded-lg border border-gray-200 dark:border-[#2b3a4e] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[#5f6b7a]">Email:</span>
                  <span className="font-bold text-[#000716] dark:text-white">admin@example.com</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#5f6b7a]">Password:</span>
                  <span className="font-bold text-[#000716] dark:text-white">admin123</span>
                </div>
              </div>
            </div>

            {/* Create Account Link */}
            <div className="mt-5 text-center">
              <p className="text-xs text-[#5f6b7a] dark:text-gray-400">
                New to AWS Route 53?{' '}
                <Link href="/register" className="text-[#0972d3] font-bold hover:underline">
                  Create a new AWS account
                </Link>
              </p>
            </div>
          </div>

          {/* Service Feature Highlights */}
          <div className="bg-white/60 dark:bg-[#192534]/60 border border-[#e9ebed] dark:border-[#2b3a4e] rounded-xl p-4 flex items-center justify-around text-xs text-[#5f6b7a] dark:text-gray-400">
            <div className="flex items-center gap-1.5 font-medium">
              <Globe className="w-4 h-4 text-[#0972d3]" />
              <span>100% SLA DNS Routing</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <Server className="w-4 h-4 text-amber-500" />
              <span>RFC 1035 BIND Support</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Session SSL Auth</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-[#5f6b7a] dark:text-gray-500 border-t border-[#e9ebed] dark:border-[#232f3e] bg-white dark:bg-[#0f1b2a]">
        © 2026, Amazon Web Services Console Clone, Inc. or its affiliates. All rights reserved.
      </footer>
    </div>
  );
}

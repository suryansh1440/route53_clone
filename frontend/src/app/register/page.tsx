'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ApiError } from '@/lib/api';
import { UserPlus, ShieldCheck, ArrowRight, CheckCircle2, Globe, Server } from 'lucide-react';

export default function RegisterPage() {
  const { register, user } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      router.push('/route53/hosted-zones');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      await register({ name, email, password });
      router.push('/route53/hosted-zones');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to create account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f2f3f3] dark:bg-[#0f1b2a] flex flex-col justify-between font-sans text-xs transition-colors">
      {/* AWS Console Header */}
      <header className="bg-[#0f1b2a] text-white py-3 px-6 flex items-center justify-between border-b border-[#232f3e] shadow-xs">
        <div className="flex items-center gap-3">
          <img src="/image.png" alt="AWS Logo" className="h-6 w-auto object-contain brightness-0 invert" />
          <div className="h-4 w-[1px] bg-[#344455]" />
          <span className="font-semibold text-sm tracking-tight text-gray-200">
            Create AWS Account — Route 53 Console
          </span>
        </div>

        <div className="text-xs text-gray-400 font-mono hidden sm:block">
          Region: <span className="text-amber-400 font-bold">Global (DNS)</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 py-10">
        <div className="w-full max-w-[440px] flex flex-col gap-6">
          {/* Main Register Card */}
          <div className="bg-white dark:bg-[#192534] border border-[#7d8998] dark:border-[#2b3a4e] rounded-2xl shadow-2xl p-8 sm:p-9 transition-all">
            {/* Header Title */}
            <div className="flex flex-col items-center text-center mb-7">
              <div className="w-14 h-14 bg-gradient-to-b from-blue-50 to-blue-100 dark:from-blue-950/40 dark:to-blue-900/20 border border-blue-200 dark:border-blue-700/40 rounded-2xl flex items-center justify-center text-[#0972d3] mb-4 shadow-sm">
                <UserPlus className="w-7 h-7 stroke-[2.2]" />
              </div>
              <h1 className="text-2xl font-extrabold text-[#000716] dark:text-white tracking-tight">
                Create an AWS Account
              </h1>
              <p className="text-xs font-medium text-[#5f6b7a] dark:text-gray-400 mt-1.5">
                Sign up to manage your DNS Hosted Zones & Records
              </p>
            </div>

            {/* Error Notification Banner */}
            {error && (
              <div className="mb-5 p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-400 font-semibold flex items-start gap-2.5 shadow-2xs">
                <span className="shrink-0 font-bold bg-red-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]">!</span>
                <span>{error}</span>
              </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                label="Full Name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <Input
                label="Email address"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Input
                label="Password"
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <Input
                label="Confirm Password"
                type="password"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />

              <div className="mt-3">
                <Button
                  variant="primary"
                  type="submit"
                  className="w-full justify-center py-3 text-sm bg-gradient-to-b from-[#ff9900] to-[#ec7211] hover:from-[#e68a00] hover:to-[#d96500] active:from-[#dd6b10] active:to-[#c85e0b] text-[#000716] font-extrabold border-none shadow-md transition-all flex items-center gap-2 rounded-xl"
                  disabled={loading}
                >
                  <span className="flex items-center justify-center gap-2">
                    <span>{loading ? 'Creating Account...' : 'Create AWS Account'}</span>
                    {!loading && <ArrowRight className="w-4 h-4 shrink-0 stroke-[2.5]" />}
                  </span>
                </Button>
              </div>
            </form>

            {/* Link back to Login */}
            <div className="mt-7 pt-5 border-t border-[#e9ebed] dark:border-[#2b3a4e] text-center">
              <p className="text-xs text-[#5f6b7a] dark:text-gray-400">
                Already have an AWS Account?{' '}
                <Link href="/login" className="text-[#0972d3] font-bold hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </div>

          {/* Service Feature Highlights */}
          <div className="bg-white/80 dark:bg-[#192534]/80 border border-[#7d8998]/40 dark:border-[#2b3a4e] rounded-xl p-3.5 flex items-center justify-around text-xs text-[#5f6b7a] dark:text-gray-400 shadow-sm backdrop-blur-xs">
            <div className="flex items-center gap-1.5 font-bold">
              <Globe className="w-4 h-4 text-[#0972d3]" />
              <span>100% SLA Routing</span>
            </div>
            <div className="flex items-center gap-1.5 font-bold">
              <Server className="w-4 h-4 text-amber-500" />
              <span>RFC 1035 BIND</span>
            </div>
            <div className="flex items-center gap-1.5 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Session SSL</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

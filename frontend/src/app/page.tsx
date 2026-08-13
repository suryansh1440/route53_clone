'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

export default function RootPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push('/route53/hosted-zones');
      } else {
        router.push('/login');
      }
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen bg-[#f2f3f3] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-[#0972d3] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}

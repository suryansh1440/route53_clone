'use client';

import React from 'react';
import Link from 'next/link';
import { ConsoleLayout } from './ConsoleLayout';
import { PageHeader } from './PageHeader';
import { Button } from '@/components/ui/Button';
import { Clock, ArrowRight } from 'lucide-react';

interface ComingSoonProps {
  title: string;
  description: string;
  featureName: string;
}

export function ComingSoonPlaceholder({
  title,
  description,
  featureName,
}: ComingSoonProps) {
  return (
    <ConsoleLayout breadcrumbs={[{ label: title }]}>
      <div className="flex flex-col gap-6">
        <PageHeader title={title} description={description} />

        <div className="bg-white border border-[#7d8998] rounded-xl p-12 text-center flex flex-col items-center justify-center gap-4 shadow-2xs">
          <div className="w-16 h-16 bg-[#e6f2fd] rounded-full flex items-center justify-center text-[#0972d3]">
            <Clock className="w-8 h-8" />
          </div>

          <h2 className="text-lg font-bold text-[#000716]">
            {featureName} is coming soon
          </h2>

          <p className="text-xs text-[#5f6b7a] max-w-md">
            This section is a mocked placeholder as part of the AWS Route 53 Clone assignment. Full functionality for Hosted Zones and DNS Records is available.
          </p>

          <div className="pt-2">
            <Link href="/route53/hosted-zones">
              <Button variant="primary" icon={<ArrowRight className="w-4 h-4" />}>
                Go to Hosted zones
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </ConsoleLayout>
  );
}

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ConsoleLayout } from '@/components/aws/ConsoleLayout';
import { Button } from '@/components/ui/Button';
import { apiFetch, ApiError } from '@/lib/api';
import { useToast } from '@/lib/toast';
import { HostedZone } from '@/types/hosted-zone';

export default function CreateHostedZonePage() {
  const router = useRouter();
  const { addToast } = useToast();

  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [type, setType] = useState<'Public' | 'Private'>('Public');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; general?: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    if (!name.trim()) {
      setFieldErrors({ name: 'Domain name is required' });
      return;
    }

    setLoading(true);

    try {
      const zone = await apiFetch<HostedZone>('/api/hosted-zones', {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim(),
          comment: comment.trim(),
          type,
        }),
      });

      addToast(
        'success',
        'Hosted zone created',
        `Successfully created hosted zone ${zone.name} (${zone.zone_id})`
      );

      router.push(`/route53/hosted-zones/${zone.zone_id}`);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409 || err.status === 422) {
          setFieldErrors({ name: err.message });
        } else {
          setFieldErrors({ general: err.message });
        }
      } else {
        setFieldErrors({ general: 'Failed to create hosted zone. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ConsoleLayout
      breadcrumbs={[
        { label: 'Hosted zones', href: '/route53/hosted-zones' },
        { label: 'Create hosted zone' },
      ]}
    >
      <div className="w-full flex flex-col gap-6 pb-12">
        {/* Page Title with Info Link */}
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold text-[#000716] tracking-tight">
            Create hosted zone
          </h1>
          <a
            href="https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/CreatingHostedZone.html"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[#0972d3] hover:underline font-medium flex items-center gap-0.5"
          >
            Info
          </a>
        </div>

        {fieldErrors.general && (
          <div className="p-4 bg-red-50 border border-red-300 rounded text-sm text-red-700 font-medium">
            {fieldErrors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Main Hosted Zone Configuration Card */}
          <div className="bg-white border border-[#7d8998] rounded-xl p-6 shadow-2xs flex flex-col gap-6">
            <div>
              <h2 className="text-xl font-bold text-[#000716]">
                Hosted zone configuration
              </h2>
              <p className="text-sm text-[#5f6b7a] mt-1 leading-relaxed">
                A hosted zone is a container that holds information about how you want to route traffic for a domain, such as example.com, and its subdomains.
              </p>
            </div>

            {/* Field 1: Domain Name */}
            <div className="flex flex-col gap-1.5 text-sm">
              <div className="flex items-center gap-1.5 font-bold text-[#000716]">
                <span>Domain name</span>
                <a href="#" className="text-sm text-[#0972d3] hover:underline font-medium">
                  Info
                </a>
              </div>
              <p className="text-[#5f6b7a] text-sm">
                This is the name of the domain that you want to route traffic for.
              </p>

              <input
                type="text"
                placeholder="example.com"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`mt-1 w-full max-w-2xl px-3.5 py-2 bg-white border rounded-md text-xs text-[#000716] focus:outline-none focus:ring-2 focus:ring-[#0972d3] focus:border-[#0972d3] placeholder:italic placeholder-gray-400 ${
                  fieldErrors.name ? 'border-red-500' : 'border-[#7d8998]'
                }`}
                required
              />

              {fieldErrors.name ? (
                <p className="text-xs text-red-600 font-medium mt-1">{fieldErrors.name}</p>
              ) : (
                <p className="text-[11px] text-[#5f6b7a] mt-1 font-mono">
                  Valid characters: a-z, 0-9, ! &quot; # $ % &amp; &apos; ( ) * + , - / : ; &lt; = &gt; ? @ [ \ ] ^ _ ` &#123; | &#125; . ~
                </p>
              )}
            </div>

            {/* Field 2: Description */}
            <div className="flex flex-col gap-1 text-[13.5px]">
              <div className="flex items-center gap-1.5 font-bold text-[#000716]">
                <span>Description - optional</span>
                <a href="#" className="text-xs text-[#0972d3] hover:underline font-medium">
                  Info
                </a>
              </div>
              <p className="text-[#5f6b7a] text-[13px]">
                This value lets you distinguish hosted zones that have the same name.
              </p>

              <textarea
                rows={3}
                placeholder="The hosted zone is used for..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="mt-1 w-full max-w-2xl px-3.5 py-2 bg-white border border-[#7d8998] rounded-md text-[13.5px] text-[#000716] focus:outline-none focus:ring-2 focus:ring-[#0972d3] focus:border-[#0972d3] placeholder:italic placeholder-gray-400"
                maxLength={256}
              />

              <div className="flex justify-between w-full max-w-2xl text-xs text-[#5f6b7a] mt-1">
                <span>The description can have up to 256 characters.</span>
                <span>{comment.length}/256</span>
              </div>
            </div>

            {/* Field 3: Type */}
            <div className="flex flex-col gap-1 text-[13.5px]">
              <div className="flex items-center gap-1.5 font-bold text-[#000716]">
                <span>Type</span>
                <a href="#" className="text-xs text-[#0972d3] hover:underline font-medium">
                  Info
                </a>
              </div>
              <p className="text-[#5f6b7a] text-[13px] mb-2">
                The type indicates whether you want to route traffic on the internet or in an Amazon VPC.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl">
                {/* Option 1: Public */}
                <label
                  className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    type === 'Public'
                      ? 'border-[#0972d3] bg-[#f2f8fd]'
                      : 'border-[#d5dbdb] hover:border-gray-400 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="type"
                    value="Public"
                    checked={type === 'Public'}
                    onChange={() => setType('Public')}
                    className="mt-1 accent-[#0972d3]"
                  />
                  <div>
                    <span className="font-bold text-[#000716] block text-xs md:text-sm">
                      Public hosted zone
                    </span>
                    <span className="text-xs text-[#5f6b7a] mt-1 block leading-relaxed">
                      A public hosted zone determines how traffic is routed on the internet.
                    </span>
                  </div>
                </label>

                {/* Option 2: Private */}
                <label
                  className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    type === 'Private'
                      ? 'border-[#0972d3] bg-[#f2f8fd]'
                      : 'border-[#d5dbdb] hover:border-gray-400 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="type"
                    value="Private"
                    checked={type === 'Private'}
                    onChange={() => setType('Private')}
                    className="mt-1 accent-[#0972d3]"
                  />
                  <div>
                    <span className="font-bold text-[#000716] block text-xs md:text-sm">
                      Private hosted zone
                    </span>
                    <span className="text-xs text-[#5f6b7a] mt-1 block leading-relaxed">
                      A private hosted zone determines how traffic is routed within an Amazon VPC.
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Section 2: Tags Box */}
          <div className="bg-white border border-[#7d8998] rounded-xl p-6 shadow-2xs flex flex-col gap-3">
            <div className="flex items-center gap-1.5 font-bold text-[#000716] text-base">
              <span>Tags</span>
              <a href="#" className="text-xs text-[#0972d3] hover:underline font-medium">
                Info
              </a>
            </div>
            <p className="text-xs text-[#5f6b7a]">
              Tags are key-value pairs that you can attach to AWS resources to help organize and identify them.
            </p>

            <div className="text-xs text-gray-500 bg-[#fafafa] border border-[#e9ebed] p-3 rounded">
              No tags applied.
            </div>
          </div>

          {/* Form Actions (Right aligned) */}
          <div className="flex items-center justify-end gap-3 bg-white p-4 border border-[#7d8998] rounded-xl">
            <Link href="/route53/hosted-zones">
              <Button variant="normal" type="button" disabled={loading}>
                Cancel
              </Button>
            </Link>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Creating hosted zone...' : 'Create hosted zone'}
            </Button>
          </div>
        </form>
      </div>
    </ConsoleLayout>
  );
}

'use client';

import React, { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ConsoleLayout } from '@/components/aws/ConsoleLayout';
import { PageHeader } from '@/components/aws/PageHeader';
import { DynamicRecordFields } from '@/components/records/DynamicRecordFields';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { HostedZone } from '@/types/hosted-zone';
import { DNSRecordType, DNSRecord } from '@/types/record';
import { apiFetch, ApiError } from '@/lib/api';
import { useToast } from '@/lib/toast';

interface PageProps {
  params: Promise<{ zoneId: string }>;
}

export default function CreateRecordPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const zoneId = resolvedParams.zoneId;

  const router = useRouter();
  const { addToast } = useToast();

  const [zone, setZone] = useState<HostedZone | null>(null);
  const [loadingZone, setLoadingZone] = useState(true);

  // Form State
  const [recordName, setRecordName] = useState('');
  const [type, setType] = useState<DNSRecordType>('A');
  const [ttl, setTtl] = useState<number>(300);
  const [value, setValue] = useState('');
  const [routingPolicy, setRoutingPolicy] = useState('Simple');

  // Type specific state
  const [priority, setPriority] = useState<number | null>(10);
  const [weight, setWeight] = useState<number | null>(1);
  const [port, setPort] = useState<number | null>(80);
  const [flag, setFlag] = useState<string | null>('0');
  const [tag, setTag] = useState<string | null>('issue');

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch zone info to construct full domain name
  const fetchZone = useCallback(async () => {
    try {
      const data = await apiFetch<HostedZone>(`/api/hosted-zones/${zoneId}`);
      setZone(data);
    } catch {
      addToast('error', 'Zone not found');
      router.push('/route53/hosted-zones');
    } finally {
      setLoadingZone(false);
    }
  }, [zoneId, addToast, router]);

  useEffect(() => {
    fetchZone();
  }, [fetchZone]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!zone) return;

    // Build full record name
    const cleanPrefix = recordName.trim().replace(/\.+$/, '');
    const fullName = cleanPrefix
      ? `${cleanPrefix}.${zone.name}`
      : zone.name;

    setLoading(true);

    try {
      const payload = {
        name: fullName,
        type,
        ttl: Number(ttl),
        value,
        routing_policy: routingPolicy,
        priority: type === 'MX' || type === 'SRV' ? priority : null,
        weight: type === 'SRV' ? weight : null,
        port: type === 'SRV' ? port : null,
        flag: type === 'CAA' ? flag : null,
        tag: type === 'CAA' ? tag : null,
      };

      const newRecord = await apiFetch<DNSRecord>(
        `/api/hosted-zones/${zoneId}/records`,
        {
          method: 'POST',
          body: JSON.stringify(payload),
        }
      );

      addToast(
        'success',
        'Record created successfully',
        `Created ${newRecord.type} record for ${newRecord.name}`
      );

      router.push(`/route53/hosted-zones/${zoneId}`);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.field) {
          setErrors({ [err.field]: err.message });
        } else {
          setErrors({ general: err.message });
        }
      } else {
        setErrors({ general: 'Failed to create record. Please check inputs.' });
      }
    } finally {
      setLoading(false);
    }
  };

  if (loadingZone) {
    return (
      <ConsoleLayout breadcrumbs={[{ label: 'Hosted zones', href: '/route53/hosted-zones' }]}>
        <div className="py-12 flex justify-center">
          <div className="w-8 h-8 border-4 border-[#0972d3] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </ConsoleLayout>
    );
  }

  if (!zone) return null;

  return (
    <ConsoleLayout
      breadcrumbs={[
        { label: 'Hosted zones', href: '/route53/hosted-zones' },
        { label: zone.name, href: `/route53/hosted-zones/${zoneId}` },
        { label: 'Create record' },
      ]}
    >
      <div className="w-full flex flex-col gap-6 pb-12">
        {/* Page Title */}
        <div>
          <h1 className="text-3xl font-bold text-[#000716] tracking-tight">
            Create record
          </h1>
          <p className="text-sm text-[#5f6b7a] mt-1">
            Create a new DNS record in hosted zone &apos;{zone.name}&apos;. Select the record type and specify the values for traffic routing.
          </p>
        </div>

        {errors.general && (
          <div className="p-4 bg-red-50 border border-red-300 rounded text-sm text-red-700 font-medium">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full">
          <div className="bg-white border border-[#7d8998] rounded-xl p-6 shadow-2xs flex flex-col gap-6 w-full">
            <h2 className="text-xl font-bold text-[#000716]">
              Record routing details
            </h2>

            {/* Record Name */}
            <div className="flex flex-col gap-1 text-xs max-w-2xl">
              <label className="font-semibold text-[#000716]">Record name</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="e.g. www, api, mail (leave blank for apex)"
                  value={recordName}
                  onChange={(e) => setRecordName(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-white border border-[#7d8998] rounded text-xs text-[#000716] focus:ring-2 focus:ring-[#0972d3]"
                />
                <span className="font-semibold text-gray-500 font-mono">.{zone.name}</span>
              </div>
              <p className="text-[11px] text-[#5f6b7a]">
                Full domain name:{' '}
                <span className="font-mono font-semibold text-[#000716]">
                  {recordName.trim() ? `${recordName.trim()}.${zone.name}` : zone.name}
                </span>
              </p>
            </div>

            {/* Record Type Selector */}
            <Select
              label="Record type"
              value={type}
              onChange={(e) => {
                setType(e.target.value as DNSRecordType);
                setErrors({});
              }}
              options={[
                { value: 'A', label: 'A - Routes traffic to an IPv4 address' },
                { value: 'AAAA', label: 'AAAA - Routes traffic to an IPv6 address' },
                { value: 'CNAME', label: 'CNAME - Routes traffic to another domain name' },
                { value: 'MX', label: 'MX - Specifies mail servers' },
                { value: 'TXT', label: 'TXT - Holds text information' },
                { value: 'NS', label: 'NS - Name server record' },
                { value: 'PTR', label: 'PTR - Reverse DNS lookup' },
                { value: 'SRV', label: 'SRV - Service locator' },
                { value: 'CAA', label: 'CAA - Certificate authority authorization' },
              ]}
            />

            {/* Dynamic Value Fields */}
            <div className="p-4 bg-[#fafafa] border border-[#e9ebed] rounded-lg">
              <DynamicRecordFields
                type={type}
                value={value}
                onChangeValue={setValue}
                priority={priority}
                onChangePriority={setPriority}
                weight={weight}
                onChangeWeight={setWeight}
                port={port}
                onChangePort={setPort}
                flag={flag}
                onChangeFlag={setFlag}
                tag={tag}
                onChangeTag={setTag}
                errors={errors}
              />
            </div>

            {/* TTL & Routing Policy */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
              <div className="flex flex-col gap-1">
                <Input
                  label="TTL (Seconds)"
                  type="number"
                  min="0"
                  value={ttl}
                  onChange={(e) => setTtl(parseInt(e.target.value) || 0)}
                  helperText="Time To Live - amount of time DNS resolvers cache this record."
                  error={errors.ttl}
                  required
                />
                <div className="flex gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setTtl(60)}
                    className="text-[11px] text-[#0972d3] hover:underline"
                  >
                    60s
                  </button>
                  <button
                    type="button"
                    onClick={() => setTtl(300)}
                    className="text-[11px] text-[#0972d3] hover:underline"
                  >
                    300s (5m)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTtl(3600)}
                    className="text-[11px] text-[#0972d3] hover:underline"
                  >
                    3600s (1h)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTtl(86400)}
                    className="text-[11px] text-[#0972d3] hover:underline"
                  >
                    86400s (1d)
                  </button>
                </div>
              </div>

              <Select
                label="Routing policy"
                value={routingPolicy}
                onChange={(e) => setRoutingPolicy(e.target.value)}
                options={[
                  { value: 'Simple', label: 'Simple routing' },
                  { value: 'Weighted', label: 'Weighted routing' },
                  { value: 'Latency', label: 'Latency-based routing' },
                  { value: 'Failover', label: 'Failover routing' },
                ]}
                helperText="Determines how Route 53 responds to queries."
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 bg-white p-4 border border-[#7d8998] rounded-xl">
            <Link href={`/route53/hosted-zones/${zoneId}`}>
              <Button variant="normal" type="button" disabled={loading}>
                Cancel
              </Button>
            </Link>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Creating record...' : 'Create record'}
            </Button>
          </div>
        </form>
      </div>
    </ConsoleLayout>
  );
}

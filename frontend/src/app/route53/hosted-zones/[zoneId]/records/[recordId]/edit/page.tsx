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
  params: Promise<{ zoneId: string; recordId: string }>;
}

export default function EditRecordPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const { zoneId, recordId } = resolvedParams;

  const router = useRouter();
  const { addToast } = useToast();

  const [zone, setZone] = useState<HostedZone | null>(null);
  const [record, setRecord] = useState<DNSRecord | null>(null);
  const [loadingInit, setLoadingInit] = useState(true);

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

  const fetchInitData = useCallback(async () => {
    try {
      const [zoneData, recordData] = await Promise.all([
        apiFetch<HostedZone>(`/api/hosted-zones/${zoneId}`),
        apiFetch<DNSRecord>(`/api/hosted-zones/${zoneId}/records/${recordId}`),
      ]);

      setZone(zoneData);
      setRecord(recordData);

      // Pre-fill form
      setRecordName(recordData.name);
      setType(recordData.type);
      setTtl(recordData.ttl);
      setValue(recordData.value);
      setRoutingPolicy(recordData.routing_policy || 'Simple');
      setPriority(recordData.priority);
      setWeight(recordData.weight);
      setPort(recordData.port);
      setFlag(recordData.flag);
      setTag(recordData.tag);
    } catch {
      addToast('error', 'Resource not found');
      router.push(`/route53/hosted-zones/${zoneId}`);
    } finally {
      setLoadingInit(false);
    }
  }, [zoneId, recordId, addToast, router]);

  useEffect(() => {
    fetchInitData();
  }, [fetchInitData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    setLoading(true);

    try {
      const payload = {
        name: recordName.trim(),
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

      const updatedRecord = await apiFetch<DNSRecord>(
        `/api/hosted-zones/${zoneId}/records/${recordId}`,
        {
          method: 'PUT',
          body: JSON.stringify(payload),
        }
      );

      addToast(
        'success',
        'Record updated',
        `Successfully updated ${updatedRecord.type} record for ${updatedRecord.name}`
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
        setErrors({ general: 'Failed to update record.' });
      }
    } finally {
      setLoading(false);
    }
  };

  if (loadingInit) {
    return (
      <ConsoleLayout breadcrumbs={[{ label: 'Hosted zones', href: '/route53/hosted-zones' }]}>
        <div className="py-12 flex justify-center">
          <div className="w-8 h-8 border-4 border-[#0972d3] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </ConsoleLayout>
    );
  }

  if (!zone || !record) return null;

  return (
    <ConsoleLayout
      breadcrumbs={[
        { label: 'Hosted zones', href: '/route53/hosted-zones' },
        { label: zone.name, href: `/route53/hosted-zones/${zoneId}` },
        { label: `Edit ${record.type} record` },
      ]}
    >
      <div className="w-full flex flex-col gap-6 pb-12">
        <PageHeader
          title={`Edit record (${record.name})`}
          description={`Update record values for ${record.name}.`}
        />

        {errors.general && (
          <div className="p-4 bg-red-50 border border-red-300 rounded text-xs text-red-700 font-medium">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="bg-white border border-[#7d8998] rounded-xl p-6 shadow-2xs flex flex-col gap-6">
            <h2 className="text-sm font-bold text-[#000716] border-b border-[#e9ebed] pb-3">
              Record details
            </h2>

            <Input
              label="Record name"
              value={recordName}
              onChange={(e) => setRecordName(e.target.value)}
              required
            />

            <Select
              label="Record type"
              value={type}
              onChange={(e) => setType(e.target.value as DNSRecordType)}
              options={[
                { value: 'A', label: 'A - IPv4 address' },
                { value: 'AAAA', label: 'AAAA - IPv6 address' },
                { value: 'CNAME', label: 'CNAME - Domain name alias' },
                { value: 'MX', label: 'MX - Mail server' },
                { value: 'TXT', label: 'TXT - Text record' },
                { value: 'NS', label: 'NS - Name server' },
                { value: 'PTR', label: 'PTR - Reverse DNS' },
                { value: 'SRV', label: 'SRV - Service location' },
                { value: 'CAA', label: 'CAA - Certificate authority authorization' },
              ]}
            />

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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="TTL (Seconds)"
                type="number"
                value={ttl}
                onChange={(e) => setTtl(parseInt(e.target.value) || 0)}
                required
              />

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
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 bg-white p-4 border border-[#7d8998] rounded-xl">
            <Link href={`/route53/hosted-zones/${zoneId}`}>
              <Button variant="normal" type="button" disabled={loading}>
                Cancel
              </Button>
            </Link>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Saving changes...' : 'Save changes'}
            </Button>
          </div>
        </form>
      </div>
    </ConsoleLayout>
  );
}

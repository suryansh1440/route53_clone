'use client';

import React from 'react';
import Link from 'next/link';
import { HostedZone } from '@/types/hosted-zone';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { ExternalLink } from 'lucide-react';

interface HostedZoneTableProps {
  zones: HostedZone[];
  loading?: boolean;
  selectedZoneId?: string | null;
  selectedZoneIds?: string[];
  onSelectZone?: (zone: HostedZone) => void;
  onToggleSelectZone?: (zone: HostedZone) => void;
  onToggleSelectAll?: () => void;
  page?: number;
  totalPages?: number;
  totalItems?: number;
  limit?: number;
  onPageChange?: (page: number) => void;
}

export function HostedZoneTable({
  zones,
  loading,
  selectedZoneId,
  selectedZoneIds = [],
  onSelectZone,
  onToggleSelectZone,
  onToggleSelectAll,
  page,
  totalPages,
  totalItems,
  limit,
  onPageChange,
}: HostedZoneTableProps) {
  const columns: Column<HostedZone>[] = [
    {
      header: 'Domain name',
      cell: (zone) => (
        <Link
          href={`/route53/hosted-zones/${zone.zone_id}`}
          className="text-[#0972d3] font-semibold hover:underline flex items-center gap-1.5"
          onClick={(e) => e.stopPropagation()}
        >
          <span>{zone.name}</span>
          <ExternalLink className="w-3 h-3 opacity-60" />
        </Link>
      ),
    },
    {
      header: 'Type',
      cell: (zone) => (
        <Badge variant={zone.type === 'Public' ? 'blue' : 'gray'}>
          {zone.type} hosted zone
        </Badge>
      ),
    },
    {
      header: 'Description',
      cell: (zone) => (
        <span className="text-[#5f6b7a]">{zone.comment || '—'}</span>
      ),
    },
    {
      header: 'Records',
      cell: (zone) => (
        <span className="font-semibold text-[#000716]">{zone.record_count}</span>
      ),
    },
    {
      header: 'Hosted zone ID',
      cell: (zone) => (
        <span className="font-mono text-xs text-[#5f6b7a]">{zone.zone_id}</span>
      ),
    },
    {
      header: 'Status',
      cell: (zone) => (
        <Badge variant={zone.status === 'Active' ? 'green' : 'gray'}>
          {zone.status}
        </Badge>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={zones}
      keyExtractor={(z) => z.zone_id}
      selectedId={selectedZoneId}
      selectedIds={selectedZoneIds}
      onSelectRow={onSelectZone}
      onToggleSelectRow={onToggleSelectZone}
      onToggleSelectAll={onToggleSelectAll}
      loading={loading}
      page={page}
      totalPages={totalPages}
      totalItems={totalItems}
      limit={limit}
      onPageChange={onPageChange}
      emptyState={
        <div className="py-6">
          <p className="font-semibold text-gray-800">No hosted zones found</p>
          <p className="text-xs text-gray-500 mt-1">
            Create a hosted zone to start routing internet traffic to your resources.
          </p>
        </div>
      }
    />
  );
}

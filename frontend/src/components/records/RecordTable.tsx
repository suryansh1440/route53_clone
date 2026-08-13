'use client';

import React from 'react';
import { DNSRecord } from '@/types/record';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Lock } from 'lucide-react';

interface RecordTableProps {
  records: DNSRecord[];
  loading?: boolean;
  selectedRecordId?: number | null;
  selectedRecordIds?: number[];
  onSelectRecord?: (record: DNSRecord) => void;
  onToggleSelectRecord?: (record: DNSRecord) => void;
  onToggleSelectAll?: () => void;
  page?: number;
  totalPages?: number;
  totalItems?: number;
  limit?: number;
  onPageChange?: (page: number) => void;
  apexDomain?: string;
}

export function RecordTable({
  records,
  loading,
  selectedRecordId,
  selectedRecordIds = [],
  onSelectRecord,
  onToggleSelectRecord,
  onToggleSelectAll,
  page,
  totalPages,
  totalItems,
  limit,
  onPageChange,
  apexDomain,
}: RecordTableProps) {
  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'A':
        return 'blue';
      case 'AAAA':
        return 'blue';
      case 'CNAME':
        return 'green';
      case 'MX':
        return 'yellow';
      case 'TXT':
        return 'gray';
      case 'NS':
        return 'gray';
      case 'SOA':
        return 'gray';
      default:
        return 'gray';
    }
  };

  const columns: Column<DNSRecord>[] = [
    {
      header: 'Record name',
      cell: (record) => {
        const isApex = apexDomain && record.name === apexDomain && (record.type === 'NS' || record.type === 'SOA');
        return (
          <div className="flex items-center gap-1.5 font-medium">
            <span className="text-[#000716] font-mono">{record.name}</span>
            {isApex && (
              <span title="Apex NS/SOA records are system managed and read-only">
                <Lock className="w-3 h-3 text-gray-400" />
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: 'Type',
      cell: (record) => (
        <Badge variant={getTypeBadgeVariant(record.type)}>{record.type}</Badge>
      ),
    },
    {
      header: 'TTL (Seconds)',
      cell: (record) => (
        <span className="font-mono text-xs text-[#5f6b7a]">{record.ttl}</span>
      ),
    },
    {
      header: 'Value / Route traffic to',
      cell: (record) => {
        let displayValue = record.value;
        if (record.type === 'MX' && record.priority !== null) {
          displayValue = `Priority: ${record.priority}  ${record.value}`;
        } else if (record.type === 'SRV') {
          displayValue = `${record.priority ?? 0} ${record.weight ?? 0} ${record.port ?? 0} ${record.value}`;
        } else if (record.type === 'CAA') {
          displayValue = `${record.flag ?? 0} ${record.tag ?? 'issue'} "${record.value}"`;
        }

        return (
          <div className="font-mono text-xs whitespace-pre-line text-[#000716] max-w-md break-all">
            {displayValue}
          </div>
        );
      },
    },
    {
      header: 'Routing policy',
      cell: (record) => (
        <span className="text-xs text-[#5f6b7a]">{record.routing_policy || 'Simple'}</span>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={records}
      keyExtractor={(r) => r.id}
      selectedId={selectedRecordId}
      selectedIds={selectedRecordIds}
      onSelectRow={onSelectRecord}
      onToggleSelectRow={onToggleSelectRecord}
      onToggleSelectAll={onToggleSelectAll}
      loading={loading}
      page={page}
      totalPages={totalPages}
      totalItems={totalItems}
      limit={limit}
      onPageChange={onPageChange}
      emptyState={
        <div className="py-6">
          <p className="font-semibold text-gray-800">No records found</p>
          <p className="text-xs text-gray-500 mt-1">
            Create a record to route traffic for your hosted zone.
          </p>
        </div>
      }
    />
  );
}

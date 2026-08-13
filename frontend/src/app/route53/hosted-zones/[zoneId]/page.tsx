'use client';

import React, { useEffect, useState, useCallback, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ConsoleLayout } from '@/components/aws/ConsoleLayout';
import { PageHeader } from '@/components/aws/PageHeader';
import { RecordTable } from '@/components/records/RecordTable';
import { SearchBar } from '@/components/ui/SearchBar';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/Modal';
import { HostedZone, PaginatedResponse } from '@/types/hosted-zone';
import { DNSRecord } from '@/types/record';
import { apiFetch, ApiError } from '@/lib/api';
import { useToast } from '@/lib/toast';
import { ImportBindModal } from '@/components/records/ImportBindModal';
import {
  Plus,
  Trash2,
  Edit,
  RefreshCw,
  Copy,
  Check,
  Globe,
  Server,
  Download,
  Upload,
  FileCode,
} from 'lucide-react';

interface PageProps {
  params: Promise<{ zoneId: string }>;
}

export default function HostedZoneDetailsPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const zoneId = resolvedParams.zoneId;

  const router = useRouter();
  const { addToast } = useToast();

  const [zone, setZone] = useState<HostedZone | null>(null);
  const [records, setRecords] = useState<DNSRecord[]>([]);
  const [loadingZone, setLoadingZone] = useState(true);
  const [loadingRecords, setLoadingRecords] = useState(true);

  // Active tab
  const [activeTab, setActiveTab] = useState<'records' | 'details'>('records');

  // Selected records for edit/delete
  const [selectedRecordIds, setSelectedRecordIds] = useState<number[]>([]);

  // Filters & Pagination for records
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Import BIND modal state
  const [importBindOpen, setImportBindOpen] = useState(false);

  // Copy state
  const [copiedNS, setCopiedNS] = useState(false);

  // Fetch Zone details
  const fetchZone = useCallback(async () => {
    setLoadingZone(true);
    try {
      const data = await apiFetch<HostedZone>(`/api/hosted-zones/${zoneId}`);
      setZone(data);
    } catch (err) {
      if (err instanceof ApiError) {
        addToast('error', 'Zone not found', err.message);
        router.push('/route53/hosted-zones');
      }
    } finally {
      setLoadingZone(false);
    }
  }, [zoneId, addToast, router]);

  // Fetch Records list
  const fetchRecords = useCallback(async () => {
    setLoadingRecords(true);
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        search: search.trim(),
        type: typeFilter,
      });

      const data = await apiFetch<PaginatedResponse<DNSRecord>>(
        `/api/hosted-zones/${zoneId}/records?${query.toString()}`
      );
      setRecords(data.items);
      setTotalPages(data.total_pages);
      setTotalItems(data.total);
    } catch (err) {
      if (err instanceof ApiError) {
        addToast('error', 'Failed to load DNS records', err.message);
      }
    } finally {
      setLoadingRecords(false);
    }
  }, [zoneId, page, search, typeFilter, addToast]);

  useEffect(() => {
    fetchZone();
  }, [fetchZone]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  useEffect(() => {
    const handleRefresh = () => {
      fetchRecords();
      fetchZone();
    };
    window.addEventListener('aws-refresh-page', handleRefresh);
    return () => window.removeEventListener('aws-refresh-page', handleRefresh);
  }, [fetchRecords, fetchZone]);

  // Multi-select Record Toggles
  const handleToggleSelectRecord = (record: DNSRecord) => {
    setSelectedRecordIds((prev) =>
      prev.includes(record.id)
        ? prev.filter((id) => id !== record.id)
        : [...prev, record.id]
    );
  };

  const handleToggleSelectAllRecords = () => {
    const pageRecordIds = records.map((r) => r.id);
    const allSelected = pageRecordIds.every((id) => selectedRecordIds.includes(id));

    if (allSelected) {
      setSelectedRecordIds((prev) => prev.filter((id) => !pageRecordIds.includes(id)));
    } else {
      setSelectedRecordIds((prev) => Array.from(new Set([...prev, ...pageRecordIds])));
    }
  };

  // Bulk Delete Records Handler
  const handleDeleteSelectedRecords = async () => {
    if (selectedRecordIds.length === 0) return;
    setDeleting(true);

    try {
      const res = await apiFetch<{ deleted_count: number }>(
        `/api/hosted-zones/${zoneId}/records/bulk-delete`,
        {
          method: 'POST',
          body: JSON.stringify({ record_ids: selectedRecordIds }),
        }
      );

      addToast(
        'success',
        'Records deleted',
        `Successfully deleted ${res.deleted_count} DNS record(s).`
      );
      setSelectedRecordIds([]);
      setDeleteModalOpen(false);
      fetchRecords();
      fetchZone();
    } catch (err) {
      if (err instanceof ApiError) {
        addToast('error', 'Failed to delete records', err.message);
      }
    } finally {
      setDeleting(false);
    }
  };

  // Export BIND Zone file
  const handleExportBIND = async () => {
    if (!zone) return;
    try {
      const res = await fetch(`/api/hosted-zones/${zone.zone_id}/export-bind`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Export failed');
      const text = await res.text();
      const blob = new Blob([text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${zone.name}.zone`;
      a.click();
      URL.revokeObjectURL(url);
      addToast('success', 'Exported BIND Zone File', `Saved ${zone.name}.zone`);
    } catch {
      addToast('error', 'Export Failed', 'Could not generate BIND zone file');
    }
  };

  // Export JSON functionality (Bonus differentiator!)
  const handleExportJSON = () => {
    if (!zone || !records) return;
    const jsonContent = JSON.stringify({ zone, records }, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${zone.name}-dns-records.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('success', 'Exported zone data', `Saved ${zone.name}-dns-records.json`);
  };

  // Copy Name Servers to Clipboard
  const handleCopyNameServers = () => {
    if (!zone?.name_servers) return;
    try {
      const nsList: string[] = JSON.parse(zone.name_servers);
      navigator.clipboard.writeText(nsList.join('\n'));
      setCopiedNS(true);
      setTimeout(() => setCopiedNS(false), 2000);
      addToast('info', 'Copied to clipboard', 'Name servers copied.');
    } catch {}
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

  const parsedNameServers: string[] = zone.name_servers
    ? JSON.parse(zone.name_servers)
    : [];

  const singleSelectedRecord = records.find((r) => selectedRecordIds.includes(r.id));
  const isApexReadOnlyRecord = Boolean(
    singleSelectedRecord &&
      zone &&
      singleSelectedRecord.name === zone.name &&
      (singleSelectedRecord.type === 'NS' || singleSelectedRecord.type === 'SOA')
  );

  return (
    <ConsoleLayout
      breadcrumbs={[
        { label: 'Hosted zones', href: '/route53/hosted-zones' },
        { label: zone.name },
      ]}
    >
      <div className="flex flex-col gap-6">
        {/* Header summary */}
        <PageHeader
          title={zone.name}
          description={`Hosted zone ID: ${zone.zone_id} | Created: ${new Date(
            zone.created_at
          ).toLocaleDateString()}`}
          actions={
            <div className="flex items-center gap-2">
              <Button
                variant="normal"
                icon={<Upload className="w-3.5 h-3.5" />}
                onClick={() => setImportBindOpen(true)}
              >
                Import BIND
              </Button>

              <Button
                variant="normal"
                icon={<FileCode className="w-3.5 h-3.5" />}
                onClick={handleExportBIND}
              >
                Export BIND
              </Button>

              <Button
                variant="normal"
                icon={<Download className="w-3.5 h-3.5" />}
                onClick={handleExportJSON}
              >
                Export JSON
              </Button>

              <Link href={`/route53/hosted-zones/${zone.zone_id}/records/new`}>
                <Button variant="primary" icon={<Plus className="w-3.5 h-3.5" />}>
                  Create record
                </Button>
              </Link>
            </div>
          }
          infoBanner={
            <div className="bg-[#fafafa] border border-[#7d8998] rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-6">
                <div>
                  <span className="text-[#5f6b7a] block text-[11px]">Type</span>
                  <Badge variant={zone.type === 'Public' ? 'blue' : 'gray'}>
                    {zone.type}
                  </Badge>
                </div>

                <div>
                  <span className="text-[#5f6b7a] block text-[11px]">Status</span>
                  <Badge variant={zone.status === 'Active' ? 'green' : 'gray'}>
                    {zone.status}
                  </Badge>
                </div>

                <div>
                  <span className="text-[#5f6b7a] block text-[11px]">Record count</span>
                  <span className="font-bold text-[#000716]">{totalItems}</span>
                </div>
              </div>

              {/* Name servers snippet */}
              <div className="flex items-center gap-3 bg-white p-2.5 rounded border border-[#e9ebed]">
                <Server className="w-4 h-4 text-[#0972d3] shrink-0" />
                <div className="font-mono text-[11px] text-[#000716]">
                  {parsedNameServers[0]} (+3 more)
                </div>
                <button
                  onClick={handleCopyNameServers}
                  className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                  title="Copy Name Servers"
                >
                  {copiedNS ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          }
        />

        {/* Tab Navigation */}
        <div className="border-b border-[#e9ebed] flex gap-6 text-sm font-semibold select-none">
          <button
            onClick={() => setActiveTab('records')}
            className={`pb-3 px-1 transition-colors relative ${
              activeTab === 'records'
                ? 'text-[#0972d3] border-b-2 border-[#0972d3]'
                : 'text-[#5f6b7a] hover:text-[#000716]'
            }`}
          >
            Records ({totalItems})
          </button>

          <button
            onClick={() => setActiveTab('details')}
            className={`pb-3 px-1 transition-colors relative ${
              activeTab === 'details'
                ? 'text-[#0972d3] border-b-2 border-[#0972d3]'
                : 'text-[#5f6b7a] hover:text-[#000716]'
            }`}
          >
            Hosted zone details
          </button>
        </div>

        {/* Tab Content: Records */}
        {activeTab === 'records' && (
          <div className="flex flex-col gap-4">
            {/* Records Toolbar */}
            <div className="bg-white border border-[#7d8998] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3 flex-1 max-w-xl">
                <SearchBar
                  value={search}
                  onChange={(val) => {
                    setSearch(val);
                    setPage(1);
                  }}
                  placeholder="Search records by name"
                  className="flex-1"
                />

                <select
                  value={typeFilter}
                  onChange={(e) => {
                    setTypeFilter(e.target.value);
                    setPage(1);
                  }}
                  className="bg-white border border-[#7d8998] rounded px-3 py-1.5 text-xs text-[#000716] focus:ring-2 focus:ring-[#0972d3]"
                >
                  <option value="">All record types</option>
                  <option value="A">A (IPv4)</option>
                  <option value="AAAA">AAAA (IPv6)</option>
                  <option value="CNAME">CNAME</option>
                  <option value="MX">MX</option>
                  <option value="TXT">TXT</option>
                  <option value="NS">NS</option>
                  <option value="SOA">SOA</option>
                  <option value="PTR">PTR</option>
                  <option value="SRV">SRV</option>
                  <option value="CAA">CAA</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="normal"
                  icon={<RefreshCw className="w-3.5 h-3.5" />}
                  onClick={() => fetchRecords()}
                  disabled={loadingRecords}
                >
                  Refresh
                </Button>

                {selectedRecordIds.length === 1 && singleSelectedRecord && (
                  <Button
                    variant="normal"
                    disabled={isApexReadOnlyRecord}
                    onClick={() =>
                      router.push(
                        `/route53/hosted-zones/${zone.zone_id}/records/${singleSelectedRecord.id}/edit`
                      )
                    }
                    icon={<Edit className="w-3.5 h-3.5" />}
                  >
                    Edit record
                  </Button>
                )}

                <Button
                  variant="danger"
                  disabled={selectedRecordIds.length === 0}
                  onClick={() => setDeleteModalOpen(true)}
                  icon={<Trash2 className="w-3.5 h-3.5" />}
                >
                  {selectedRecordIds.length > 1
                    ? `Delete ${selectedRecordIds.length} records`
                    : 'Delete record'}
                </Button>
              </div>
            </div>

            {/* Records Data Table */}
            <RecordTable
              records={records}
              loading={loadingRecords}
              selectedRecordIds={selectedRecordIds}
              onToggleSelectRecord={handleToggleSelectRecord}
              onToggleSelectAll={handleToggleSelectAllRecords}
              page={page}
              totalPages={totalPages}
              totalItems={totalItems}
              limit={20}
              onPageChange={(p) => setPage(p)}
              apexDomain={zone.name}
            />
          </div>
        )}

        {/* Tab Content: Details */}
        {activeTab === 'details' && (
          <div className="bg-white border border-[#7d8998] rounded-xl p-6 shadow-xs flex flex-col gap-6 text-xs">
            <h3 className="text-sm font-bold text-[#000716] border-b border-[#e9ebed] pb-3">
              Hosted zone configuration
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <span className="text-[#5f6b7a] font-semibold block">Domain name</span>
                <span className="text-[#000716] font-bold text-sm mt-0.5 block">
                  {zone.name}
                </span>
              </div>

              <div>
                <span className="text-[#5f6b7a] font-semibold block">Hosted zone ID</span>
                <span className="font-mono text-[#000716] mt-0.5 block">{zone.zone_id}</span>
              </div>

              <div>
                <span className="text-[#5f6b7a] font-semibold block">Type</span>
                <span className="mt-1 block">
                  <Badge variant={zone.type === 'Public' ? 'blue' : 'gray'}>
                    {zone.type} hosted zone
                  </Badge>
                </span>
              </div>

              <div>
                <span className="text-[#5f6b7a] font-semibold block">Description</span>
                <span className="text-[#000716] mt-0.5 block">
                  {zone.comment || 'No description provided.'}
                </span>
              </div>
            </div>

            {/* Name Servers Details Box */}
            <div className="border-t border-[#e9ebed] pt-6 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-[#000716]">Name servers (NS)</h4>
                <Button variant="normal" size="sm" onClick={handleCopyNameServers}>
                  Copy name servers
                </Button>
              </div>

              <p className="text-[#5f6b7a] text-[11px]">
                To use Route 53 to route DNS queries for {zone.name}, update your domain
                registrar's settings to use these name servers:
              </p>

              <div className="bg-[#fafafa] border border-[#e9ebed] rounded p-4 font-mono text-xs text-[#000716] space-y-1.5">
                {parsedNameServers.map((ns, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-[#0972d3]" />
                    <span>{ns}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Record Confirmation Modal */}
      <ConfirmDialog
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteSelectedRecords}
        title={selectedRecordIds.length > 1 ? `Delete ${selectedRecordIds.length} records?` : 'Delete record?'}
        message={
          selectedRecordIds.length > 1
            ? `Are you sure you want to delete ${selectedRecordIds.length} selected DNS records? Traffic routed to these records will no longer reach their destinations.`
            : `Are you sure you want to delete the ${singleSelectedRecord?.type} record for '${singleSelectedRecord?.name}'? Traffic routed to this record will no longer reach its destination.`
        }
        confirmText={selectedRecordIds.length > 1 ? `Delete ${selectedRecordIds.length} records` : 'Delete record'}
        loading={deleting}
      />

      {/* BIND Zone File Import Modal */}
      <ImportBindModal
        isOpen={importBindOpen}
        onClose={() => setImportBindOpen(false)}
        zoneId={zone.zone_id}
        zoneName={zone.name}
        onSuccess={() => {
          fetchRecords();
          fetchZone();
        }}
      />
    </ConsoleLayout>
  );
}

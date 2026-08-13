'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ConsoleLayout } from '@/components/aws/ConsoleLayout';
import { PageHeader } from '@/components/aws/PageHeader';
import { HostedZoneTable } from '@/components/hosted-zones/HostedZoneTable';
import { SearchBar } from '@/components/ui/SearchBar';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/Modal';
import { HostedZone, PaginatedResponse } from '@/types/hosted-zone';
import { apiFetch, ApiError } from '@/lib/api';
import { useToast } from '@/lib/toast';
import { Plus, Trash2, ExternalLink, RefreshCw } from 'lucide-react';

export default function HostedZonesPage() {
  const router = useRouter();
  const { addToast } = useToast();

  const [zones, setZones] = useState<HostedZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedZoneIds, setSelectedZoneIds] = useState<string[]>([]);

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchZones = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search: search.trim(),
        type: typeFilter,
      });

      const data = await apiFetch<PaginatedResponse<HostedZone>>(
        `/api/hosted-zones?${query.toString()}`
      );
      setZones(data.items);
      setTotalPages(data.total_pages);
      setTotalItems(data.total);
    } catch (err) {
      if (err instanceof ApiError) {
        addToast('error', 'Failed to load hosted zones', err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [page, search, typeFilter, addToast]);

  useEffect(() => {
    fetchZones();
  }, [fetchZones]);

  useEffect(() => {
    const handleRefresh = () => fetchZones();
    window.addEventListener('aws-refresh-page', handleRefresh);
    return () => window.removeEventListener('aws-refresh-page', handleRefresh);
  }, [fetchZones]);

  // Multi-select Toggles
  const handleToggleSelectZone = (zone: HostedZone) => {
    setSelectedZoneIds((prev) =>
      prev.includes(zone.zone_id)
        ? prev.filter((id) => id !== zone.zone_id)
        : [...prev, zone.zone_id]
    );
  };

  const handleToggleSelectAll = () => {
    const pageZoneIds = zones.map((z) => z.zone_id);
    const allSelected = pageZoneIds.every((id) => selectedZoneIds.includes(id));

    if (allSelected) {
      setSelectedZoneIds((prev) => prev.filter((id) => !pageZoneIds.includes(id)));
    } else {
      setSelectedZoneIds((prev) => Array.from(new Set([...prev, ...pageZoneIds])));
    }
  };

  // Handle bulk delete
  const handleDeleteSelectedZones = async () => {
    if (selectedZoneIds.length === 0) return;
    setDeleting(true);

    try {
      const res = await apiFetch<{ deleted_count: number }>('/api/hosted-zones/bulk-delete', {
        method: 'POST',
        body: JSON.stringify({ zone_ids: selectedZoneIds }),
      });

      addToast(
        'success',
        'Bulk Deletion Completed',
        `Successfully deleted ${res.deleted_count} hosted zone(s).`
      );
      setSelectedZoneIds([]);
      setDeleteModalOpen(false);
      fetchZones();
    } catch (err) {
      if (err instanceof ApiError) {
        addToast('error', 'Failed to delete hosted zones', err.message);
      }
    } finally {
      setDeleting(false);
    }
  };

  const singleSelectedZone = zones.find((z) => selectedZoneIds.includes(z.zone_id));

  return (
    <ConsoleLayout breadcrumbs={[{ label: 'Hosted zones' }]}>
      <div className="flex flex-col gap-6">
        {/* Page Header */}
        <PageHeader
          title="Hosted zones"
          description="A hosted zone is a container for records, which include information about how you want to route traffic for a domain (such as example.com) and its subdomains."
          actions={
            <div className="flex items-center gap-2">
              <Button
                variant="normal"
                icon={<RefreshCw className="w-3.5 h-3.5" />}
                onClick={() => fetchZones()}
                disabled={loading}
              >
                Refresh
              </Button>

              {selectedZoneIds.length === 1 && singleSelectedZone && (
                <Button
                  variant="normal"
                  onClick={() => router.push(`/route53/hosted-zones/${singleSelectedZone.zone_id}`)}
                  icon={<ExternalLink className="w-3.5 h-3.5" />}
                >
                  View details
                </Button>
              )}

              <Button
                variant="danger"
                disabled={selectedZoneIds.length === 0}
                onClick={() => setDeleteModalOpen(true)}
                icon={<Trash2 className="w-3.5 h-3.5" />}
              >
                {selectedZoneIds.length > 1
                  ? `Delete ${selectedZoneIds.length} zones`
                  : 'Delete zone'}
              </Button>

              <Link href="/route53/hosted-zones/new">
                <Button variant="primary" icon={<Plus className="w-3.5 h-3.5" />}>
                  Create hosted zone
                </Button>
              </Link>
            </div>
          }
        />

        {/* Toolbar & Table Box */}
        <div className="bg-white border border-[#7d8998] rounded-xl shadow-xs overflow-hidden">
          {/* Table Header Filter Bar */}
          <div className="p-4 border-b border-[#e9ebed] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#fafafa]">
            <div className="flex items-center gap-3 flex-1 max-w-lg">
              <SearchBar
                value={search}
                onChange={(val) => {
                  setSearch(val);
                  setPage(1);
                }}
                placeholder="Find hosted zone by name"
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
                <option value="">All zone types</option>
                <option value="Public">Public hosted zone</option>
                <option value="Private">Private hosted zone</option>
              </select>
            </div>

            <div className="text-xs text-[#5f6b7a]">
              Total: <span className="font-semibold text-[#000716]">{totalItems}</span> zones
            </div>
          </div>

          {/* Hosted Zones Table */}
          <HostedZoneTable
            zones={zones}
            loading={loading}
            selectedZoneIds={selectedZoneIds}
            onToggleSelectZone={handleToggleSelectZone}
            onToggleSelectAll={handleToggleSelectAll}
            page={page}
            totalPages={totalPages}
            totalItems={totalItems}
            limit={10}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteSelectedZones}
        title={selectedZoneIds.length > 1 ? `Delete ${selectedZoneIds.length} hosted zones?` : 'Delete hosted zone?'}
        message={
          selectedZoneIds.length > 1
            ? `Are you sure you want to delete ${selectedZoneIds.length} selected hosted zones? This will permanently delete all associated DNS records for these zones. This action cannot be undone.`
            : `Are you sure you want to delete hosted zone '${singleSelectedZone?.name}' (${singleSelectedZone?.zone_id})? This will permanently delete all DNS records associated with this zone.`
        }
        confirmText={selectedZoneIds.length > 1 ? `Delete ${selectedZoneIds.length} zones` : 'Delete zone'}
        loading={deleting}
      />
    </ConsoleLayout>
  );
}

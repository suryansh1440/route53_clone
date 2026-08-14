'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { apiFetch, ApiError } from '@/lib/api';
import { useToast } from '@/lib/toast';
import { Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

interface ImportBindModalProps {
  isOpen: boolean;
  onClose: () => void;
  zoneId: string;
  zoneName: string;
  onSuccess: () => void;
}

export function ImportBindModal({
  isOpen,
  onClose,
  zoneId,
  zoneName,
  onSuccess,
}: ImportBindModalProps) {
  const { addToast } = useToast();
  const [bindText, setBindText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ created_count: number; failed_count: number; errors: string[] } | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      if (content) {
        setBindText(content);
      }
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!bindText.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const data = await apiFetch<{ created_count: number; failed_count: number; errors: string[] }>(
        `/api/hosted-zones/${zoneId}/import-bind`,
        {
          method: 'POST',
          body: JSON.stringify({ bind_text: bindText }),
        }
      );

      setResult(data);
      addToast(
        'success',
        'BIND Import Completed',
        `Successfully imported ${data.created_count} record(s).`
      );
      onSuccess();
    } catch (err) {
      if (err instanceof ApiError) {
        addToast('error', 'BIND Import Failed', err.message);
      } else {
        addToast('error', 'BIND Import Failed', 'An error occurred during parsing.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Import BIND Zone File for ${zoneName}`}>
      <div className="flex flex-col gap-4 text-xs">
        <p className="text-[#5f6b7a]">
          Paste standard RFC 1035 BIND zone file contents below or choose a <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-[11px]">.zone</code> / <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-[11px]">.txt</code> file to import DNS records.
        </p>

        {/* File Upload Box */}
        <div className="border-2 border-dashed border-[#7d8998] rounded-xl p-4 bg-[#fafafa] flex flex-col items-center justify-center gap-2 hover:bg-[#f2f8fd] transition-colors cursor-pointer relative">
          <input
            type="file"
            accept=".zone,.txt,.bind"
            onChange={handleFileUpload}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
          <Upload className="w-6 h-6 text-[#0972d3]" />
          <span className="font-semibold text-[#000716]">Click or drag & drop BIND zone file</span>
          <span className="text-[11px] text-gray-500">Supports .zone, .txt files</span>
        </div>

        {/* Textarea */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <label className="font-semibold text-[#000716] flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-gray-500" />
              <span>Zone File Contents</span>
            </label>
            <button
              type="button"
              onClick={() =>
                setBindText(
                  `$ORIGIN ${zoneName}.\n$TTL 300\n\n; Sample RFC 1035 BIND Zone File\n@       IN  A     192.168.1.10\napi     IN  A     192.168.1.20\nwww     IN  CNAME ${zoneName}.\nmail    IN  MX    10 mail.${zoneName}.\nmail    IN  A     192.168.1.30\n@       IN  TXT   "v=spf1 include:_spf.google.com ~all"\n_sip._tcp IN SRV 10 5 5060 sip.${zoneName}.\n@       IN  CAA   0 issue "letsencrypt.org"`
                )
              }
              className="text-[11px] font-bold text-[#0972d3] hover:underline flex items-center gap-1"
            >
              <span>+ Load Sample .zone Data</span>
            </button>
          </div>
          <textarea
            rows={8}
            value={bindText}
            onChange={(e) => setBindText(e.target.value)}
            placeholder={`$ORIGIN ${zoneName}.\n$TTL 300\n@ IN A 192.168.1.10\nwww IN CNAME @\nmail IN MX 10 mail.${zoneName}.`}
            className="w-full px-3 py-2 bg-white dark:bg-[#15202e] border border-[#7d8998] dark:border-[#2b3a4e] rounded-md font-mono text-xs text-[#000716] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0972d3]"
          />
        </div>

        {/* Import Results Banner */}
        {result && (
          <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-emerald-800 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Imported {result.created_count} record(s)</span>
            </div>
            {result.failed_count > 0 && (
              <div className="text-[11px] text-amber-700 mt-1">
                <span className="font-bold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {result.failed_count} record(s) skipped/failed:
                </span>
                <ul className="list-disc list-inside mt-0.5 space-y-0.5 font-mono">
                  {result.errors.map((e, idx) => (
                    <li key={idx}>{e}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e9ebed]">
          <Button variant="normal" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleImport} disabled={loading || !bindText.trim()}>
            {loading ? 'Importing records...' : 'Import BIND records'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

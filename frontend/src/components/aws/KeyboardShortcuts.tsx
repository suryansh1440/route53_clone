'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Modal } from '@/components/ui/Modal';
import { Keyboard, Command } from 'lucide-react';

export function KeyboardShortcutsModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const shortcuts = [
    { key: 'Alt + S', desc: 'Focus Search bar' },
    { key: 'Shift + N', desc: 'Create new hosted zone' },
    { key: 'Shift + R', desc: 'Refresh page data' },
    { key: 'Esc', desc: 'Close open dialogs / modals' },
    { key: '?', desc: 'Toggle keyboard shortcuts help' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Keyboard Shortcuts">
      <div className="flex flex-col gap-4 text-xs">
        <div className="flex items-center gap-2 text-[#5f6b7a]">
          <Keyboard className="w-4 h-4 text-[#0972d3]" />
          <span>Use these global hotkeys for speed navigation in AWS Console.</span>
        </div>

        <div className="divide-y divide-[#e9ebed] border border-[#7d8998] rounded-xl overflow-hidden bg-white">
          {shortcuts.map((sc) => (
            <div key={sc.key} className="flex items-center justify-between p-3">
              <span className="text-[#000716] font-medium">{sc.desc}</span>
              <kbd className="px-2.5 py-1 bg-gray-100 border border-gray-300 rounded font-mono text-[11px] font-bold text-[#000716]">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#0972d3] text-white font-semibold rounded hover:bg-[#033160] transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </Modal>
  );
}

export function useKeyboardShortcuts(onRefresh?: () => void) {
  const router = useRouter();
  const [shortcutsModalOpen, setShortcutsModalOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid triggering when user is typing in inputs or textareas
      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      if (['input', 'textarea', 'select'].includes(activeTag)) {
        if (e.key === 'Escape') {
          (document.activeElement as HTMLElement)?.blur();
        }
        return;
      }

      if (e.altKey && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        if (searchInput) searchInput.focus();
      } else if (e.shiftKey && (e.key === 'N' || e.key === 'n')) {
        e.preventDefault();
        router.push('/route53/hosted-zones/new');
      } else if (e.shiftKey && (e.key === 'R' || e.key === 'r')) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('aws-refresh-page'));
        router.refresh();
        if (onRefresh) onRefresh();
      } else if (e.key === '?') {
        e.preventDefault();
        setShortcutsModalOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router, onRefresh]);

  return {
    shortcutsModalOpen,
    openShortcutsModal: () => setShortcutsModalOpen(true),
    closeShortcutsModal: () => setShortcutsModalOpen(false),
  };
}

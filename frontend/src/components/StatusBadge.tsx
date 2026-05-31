import type { Video, Draft } from '../types';

// Normalize backend status to frontend status
const normalizeStatus = (status: string | undefined): string => {
  if (!status) return 'raw';
  const map: Record<string, string> = {
    RAW: 'raw',
    RENDERED: 'rendered',
    DRAFTED: 'drafted',
    POSTED: 'posted',
    DRAFT: 'pending',
    READY: 'ready',
    MANUAL_REQUIRED: 'ready',
  };
  return map[status] ?? status.toLowerCase();
};

const statusConfig: Record<string, { label: string; color: string }> = {
  raw: { label: 'Raw', color: 'bg-slate-600 text-slate-200' },
  rendered: { label: 'Rendered', color: 'bg-blue-600 text-blue-100' },
  captioned: { label: 'Captioned', color: 'bg-purple-600 text-purple-100' },
  drafted: { label: 'Drafted', color: 'bg-amber-600 text-amber-100' },
  posted: { label: 'Posted', color: 'bg-green-600 text-green-100' },
  pending: { label: 'Pending', color: 'bg-slate-600 text-slate-200' },
  ready: { label: 'Ready', color: 'bg-emerald-600 text-emerald-100' },
  failed: { label: 'Failed', color: 'bg-red-600 text-red-100' },
};

export default function StatusBadge({
  status,
}: {
  status: Video['status'] | Draft['status'] | string;
}) {
  const normalized = normalizeStatus(status);
  const cfg = statusConfig[normalized] ?? { label: status, color: 'bg-slate-600 text-slate-200' };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}
    >
      {cfg.label}
    </span>
  );
}

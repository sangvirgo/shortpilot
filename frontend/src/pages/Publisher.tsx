import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Loader2,
  ExternalLink,
  Copy,
  Check,
  Send,
  Calendar,
  Link2,
  ArrowLeft,
} from 'lucide-react';
import { draftsApi, publisherApi } from '../api/client';
import StatusBadge from '../components/StatusBadge';
import { toast } from '../store/toast';

export default function Publisher() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const draftIdParam = searchParams.get('draft_id');
  const [selectedDraftId, setSelectedDraftId] = useState(draftIdParam ?? '');
  const [tiktokUrl, setTiktokUrl] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  const { data: drafts } = useQuery({
    queryKey: ['drafts'],
    queryFn: () => draftsApi.list(),
  });

  const { data: draft, isLoading: draftLoading } = useQuery({
    queryKey: ['draft', selectedDraftId],
    queryFn: () => draftsApi.get(selectedDraftId),
    enabled: !!selectedDraftId,
  });

  const prepareMutation = useMutation({
    mutationFn: () => publisherApi.prepare(selectedDraftId),
    onSuccess: (data) => {
      toast.success('TikTok package ready!');
      // Copy caption to clipboard
      if (data.caption_text) {
        navigator.clipboard.writeText(data.caption_text);
        toast.success('Caption copied to clipboard!');
      }
    },
    onError: () => toast.error('Failed to prepare'),
  });

  const markPostedMutation = useMutation({
    mutationFn: () =>
      publisherApi.markPosted(selectedDraftId, {
        tiktok_url: tiktokUrl || undefined,
      }),
    onSuccess: () => {
      toast.success('Marked as posted!');
      queryClient.invalidateQueries({ queryKey: ['drafts'] });
      queryClient.invalidateQueries({ queryKey: ['draft', selectedDraftId] });
    },
    onError: () => toast.error('Failed to mark as posted'),
  });

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
    toast.success('Copied!');
  };

  // Normalize hashtags
  const getHashtags = (): string[] => {
    if (!draft) return [];
    const h = draft.hashtags;
    if (Array.isArray(h)) return h;
    if (typeof h === 'string') {
      try { return JSON.parse(h); } catch { return []; }
    }
    return [];
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Publisher</h1>
        <p className="text-slate-400 mt-1">Prepare and publish your TikTok content</p>
      </div>

      {/* Draft Selector */}
      {!draftIdParam && (
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
          <label className="block text-sm font-medium text-slate-300 mb-2">Select a Draft</label>
          <select
            value={selectedDraftId}
            onChange={(e) => setSelectedDraftId(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
          >
            <option value="">Choose a draft...</option>
            {(drafts ?? []).map((d) => (
              <option key={d.id} value={d.id}>
                {(d.hook || '').slice(0, 60)} — {d.status}
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedDraftId && draftLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
        </div>
      )}

      {selectedDraftId && draft && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Content */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-white">Caption Preview</h3>
                <button
                  onClick={() => {
                    const tags = getHashtags();
                    handleCopy(
                      `${draft.hook}\n\n${draft.caption}\n\n${tags.map((h) => `#${h}`).join(' ')}`,
                      'full'
                    );
                  }}
                  className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-800"
                >
                  {copied === 'full' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  Copy All
                </button>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4 space-y-3 text-sm">
                <p className="text-slate-200 font-medium">{draft.hook}</p>
                <p className="text-slate-400 whitespace-pre-wrap">{draft.caption}</p>
                <p className="text-blue-400">
                  {getHashtags().map((h) => `#${h}`).join(' ')}
                </p>
                {draft.cta_type && <p className="text-amber-400">{draft.cta_type}</p>}
              </div>
            </div>
          </div>

          {/* Actions Panel */}
          <div className="space-y-4">
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Send className="w-4 h-4 text-purple-400" />
                Publish
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => prepareMutation.mutate()}
                  disabled={prepareMutation.isPending}
                  className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors text-sm"
                >
                  {prepareMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  {prepareMutation.isPending ? 'Preparing...' : 'Prepare TikTok Package'}
                </button>

                <a
                  href="https://www.tiktok.com/creator#/upload"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-medium py-2.5 rounded-lg transition-colors text-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open TikTok Studio
                </a>
              </div>
            </div>

            {/* Mark as Posted */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Mark as Posted</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    <Link2 className="w-3 h-3 inline mr-1" />
                    TikTok URL (optional)
                  </label>
                  <input
                    type="url"
                    value={tiktokUrl}
                    onChange={(e) => setTiktokUrl(e.target.value)}
                    placeholder="https://tiktok.com/@user/video/..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <button
                  onClick={() => markPostedMutation.mutate()}
                  disabled={markPostedMutation.isPending}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors text-sm"
                >
                  {markPostedMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  Mark as Posted
                </button>
              </div>
            </div>

            {/* Draft Info */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
              <h3 className="text-sm font-semibold text-white mb-3">Info</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-500">Status</dt>
                  <dd><StatusBadge status={draft.status} /></dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Created</dt>
                  <dd className="text-slate-300">
                    {draft.created_at ? new Date(draft.created_at).toLocaleDateString() : '—'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      )}

      {!selectedDraftId && (
        <div className="text-center py-16">
          <Send className="w-16 h-16 text-slate-700 mx-auto mb-4" />
          <p className="text-slate-500 text-lg">Select a draft to publish</p>
          <button
            onClick={() => navigate('/drafts')}
            className="mt-4 text-purple-400 hover:text-purple-300 flex items-center gap-1 mx-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            Go to Drafts
          </button>
        </div>
      )}
    </div>
  );
}

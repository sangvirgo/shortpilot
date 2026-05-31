import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Loader2,
  FileText,
  Plus,
  Trash2,
  Edit3,
  Send,
  X,
  Calendar,
} from 'lucide-react';
import { draftsApi } from '../api/client';
import StatusBadge from '../components/StatusBadge';
import { toast } from '../store/toast';
import type { Draft } from '../types';

export default function DraftManager() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const prefillHook = searchParams.get('hook') ?? '';
  const prefillCaption = searchParams.get('caption') ?? '';
  const prefillHashtags = searchParams.get('hashtags') ?? '';

  const [showForm, setShowForm] = useState(!!prefillHook);
  const [editingDraft, setEditingDraft] = useState<Draft | null>(null);
  const [form, setForm] = useState({
    video_id: searchParams.get('video_id') ?? '1',
    hook: prefillHook,
    caption: prefillCaption,
    hashtags: prefillHashtags,
    cta_type: '',
    scheduled_at: '',
  });

  const { data: drafts, isLoading } = useQuery({
    queryKey: ['drafts'],
    queryFn: () => draftsApi.list(),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      draftsApi.create({
        video_id: form.video_id,
        hook: form.hook,
        caption: form.caption,
        hashtags: form.hashtags.split(',').map((h) => h.trim()).filter(Boolean),
        cta_type: form.cta_type,
        scheduled_at: form.scheduled_at || undefined,
      }),
    onSuccess: () => {
      toast.success('Draft created!');
      queryClient.invalidateQueries({ queryKey: ['drafts'] });
      resetForm();
    },
    onError: () => toast.error('Failed to create draft'),
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      draftsApi.update(editingDraft!.id, {
        hook: form.hook,
        caption: form.caption,
        hashtags: form.hashtags.split(',').map((h) => h.trim()).filter(Boolean),
        cta_type: form.cta_type,
        scheduled_at: form.scheduled_at || undefined,
      }),
    onSuccess: () => {
      toast.success('Draft updated!');
      queryClient.invalidateQueries({ queryKey: ['drafts'] });
      resetForm();
    },
    onError: () => toast.error('Failed to update draft'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => draftsApi.delete(id),
    onSuccess: () => {
      toast.success('Draft deleted');
      queryClient.invalidateQueries({ queryKey: ['drafts'] });
    },
    onError: () => toast.error('Failed to delete draft'),
  });

  const resetForm = () => {
    setForm({ video_id: '1', hook: '', caption: '', hashtags: '', cta_type: '', scheduled_at: '' });
    setShowForm(false);
    setEditingDraft(null);
  };

  const getHashtags = (d: Draft): string[] => {
    const h = d.hashtags;
    if (Array.isArray(h)) return h;
    if (typeof h === 'string') { try { return JSON.parse(h); } catch { return []; } }
    return [];
  };

  const startEdit = (draft: Draft) => {
    setEditingDraft(draft);
    setForm({
      video_id: String(draft.video_id ?? ''),
      hook: draft.hook ?? '',
      caption: draft.caption ?? '',
      hashtags: getHashtags(draft).join(', '),
      cta_type: draft.cta_type ?? '',
      scheduled_at: draft.scheduled_at?.slice(0, 16) ?? '',
    });
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Draft Manager</h1>
          <p className="text-slate-400 mt-1">Create and manage your TikTok drafts</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-medium px-4 py-2.5 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Draft
        </button>
      </div>

      {showForm && (
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">
              {editingDraft ? 'Edit Draft' : 'New Draft'}
            </h2>
            <button onClick={resetForm} className="text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Video ID</label>
              <input type="text" value={form.video_id}
                onChange={(e) => setForm({ ...form, video_id: e.target.value })}
                disabled={!!editingDraft}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 disabled:opacity-50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                <Calendar className="w-3.5 h-3.5 inline mr-1" /> Scheduled At
              </label>
              <input type="datetime-local" value={form.scheduled_at}
                onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Hook</label>
            <input type="text" value={form.hook}
              onChange={(e) => setForm({ ...form, hook: e.target.value })}
              placeholder="Your attention-grabbing hook..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Caption</label>
            <textarea value={form.caption} rows={4}
              onChange={(e) => setForm({ ...form, caption: e.target.value })}
              placeholder="Full caption text..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 resize-none" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Hashtags (comma separated)</label>
              <input type="text" value={form.hashtags}
                onChange={(e) => setForm({ ...form, hashtags: e.target.value })}
                placeholder="trending, viral, fyp"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">CTA Type</label>
              <select value={form.cta_type}
                onChange={(e) => setForm({ ...form, cta_type: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500">
                <option value="">Select...</option>
                <option value="FOLLOW">Follow</option>
                <option value="SAVE">Save</option>
                <option value="COMMENT">Comment</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => editingDraft ? updateMutation.mutate() : createMutation.mutate()}
              disabled={createMutation.isPending || updateMutation.isPending}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-medium px-6 py-2.5 rounded-lg transition-colors"
            >
              {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="w-4 h-4 animate-spin" />}
              {editingDraft ? 'Update Draft' : 'Create Draft'}
            </button>
            <button onClick={resetForm} className="px-6 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
        </div>
      ) : drafts && drafts.length > 0 ? (
        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Hook</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Status</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Scheduled</th>
                <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {drafts.map((draft) => (
                <tr key={draft.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                  <td className="px-5 py-4">
                    <p className="text-sm text-slate-200 font-medium truncate max-w-md">{draft.hook}</p>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">{draft.caption}</p>
                  </td>
                  <td className="px-5 py-4"><StatusBadge status={draft.status} /></td>
                  <td className="px-5 py-4 text-sm text-slate-400">
                    {draft.scheduled_at ? new Date(draft.scheduled_at).toLocaleString() : '—'}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => startEdit(draft)} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700" title="Edit">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button onClick={() => navigate(`/publisher?draft_id=${draft.id}`)} className="p-2 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10" title="Publish">
                        <Send className="w-4 h-4" />
                      </button>
                      <button onClick={() => { if (confirm('Delete?')) deleteMutation.mutate(draft.id); }} className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-20">
          <FileText className="w-16 h-16 text-slate-700 mx-auto mb-4" />
          <p className="text-slate-500 text-lg">No drafts yet</p>
        </div>
      )}
    </div>
  );
}

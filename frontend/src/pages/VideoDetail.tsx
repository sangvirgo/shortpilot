import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Loader2,
  Play,
  Trash2,
  Type,
  Scissors,
  Captions,
  FileText,
  Wand2,
} from 'lucide-react';
import { videosApi, rendererApi } from '../api/client';
import StatusBadge from '../components/StatusBadge';
import { toast } from '../store/toast';

export default function VideoDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [textOverlay, setTextOverlay] = useState('');
  const [trimDuration, setTrimDuration] = useState<number>(12);

  const { data: video, isLoading } = useQuery({
    queryKey: ['video', id],
    queryFn: () => videosApi.get(id!),
    enabled: !!id,
  });

  const renderMutation = useMutation({
    mutationFn: () =>
      rendererApi.render({
        video_id: id!,
        text_overlay: textOverlay || undefined,
        trim_duration: trimDuration > 0 ? trimDuration : undefined,
      }),
    onSuccess: () => {
      toast.success('Video rendered!');
      queryClient.invalidateQueries({ queryKey: ['video', id] });
      queryClient.invalidateQueries({ queryKey: ['videos'] });
    },
    onError: () => toast.error('Render failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => videosApi.delete(id!),
    onSuccess: () => {
      toast.success('Video deleted');
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      navigate('/videos');
    },
    onError: () => toast.error('Delete failed'),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  if (!video) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500 text-lg">Video not found</p>
        <button onClick={() => navigate('/videos')} className="mt-4 text-purple-400 hover:text-purple-300">
          ← Back to library
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/videos')} className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">{video.title || 'Untitled'}</h1>
          <div className="flex items-center gap-3 mt-1">
            <StatusBadge status={video.status} />
            <span className="text-sm text-slate-500 capitalize">{video.source_type}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="aspect-[9/16] max-h-[600px] mx-auto bg-slate-900 rounded-xl border border-slate-800 overflow-hidden flex items-center justify-center">
            {video.url ? (
              <video src={video.url} controls className="w-full h-full object-contain" />
            ) : video.thumbnail ? (
              <img src={video.thumbnail} alt={video.title} className="w-full h-full object-contain" />
            ) : (
              <div className="text-center">
                <Play className="w-16 h-16 text-slate-700 mx-auto mb-2" />
                <p className="text-slate-500">No preview available</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Wand2 className="w-4 h-4 text-purple-400" /> Render Video
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  <Type className="w-3 h-3 inline mr-1" /> Text Overlay
                </label>
                <input type="text" value={textOverlay}
                  onChange={(e) => setTextOverlay(e.target.value)}
                  placeholder="Add hook text..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  <Scissors className="w-3 h-3 inline mr-1" /> Trim (seconds)
                </label>
                <input type="number" min={0} max={60} value={trimDuration}
                  onChange={(e) => setTrimDuration(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500" />
              </div>
              <button onClick={() => renderMutation.mutate()} disabled={renderMutation.isPending}
                className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors text-sm">
                {renderMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                {renderMutation.isPending ? 'Rendering...' : 'Render'}
              </button>
            </div>
          </div>

          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 space-y-2">
            <h3 className="text-sm font-semibold text-white mb-3">Actions</h3>
            <button onClick={() => navigate(`/captions?niche=${encodeURIComponent(video.niche || '')}`)}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white">
              <Captions className="w-4 h-4 text-blue-400" /> Create Caption
            </button>
            <button onClick={() => navigate(`/drafts?video_id=${id}`)}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white">
              <FileText className="w-4 h-4 text-amber-400" /> Create Draft
            </button>
            <button onClick={() => { if (confirm('Delete?')) deleteMutation.mutate(); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10">
              <Trash2 className="w-4 h-4" /> Delete Video
            </button>
          </div>

          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
            <h3 className="text-sm font-semibold text-white mb-3">Info</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Source</dt>
                <dd className="text-slate-300">{video.source_url ? <a href={video.source_url} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">{video.source_type}</a> : video.source_type}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">License</dt>
                <dd className="text-slate-300 text-xs">{video.license_note || '—'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Created</dt>
                <dd className="text-slate-300">{video.created_at ? new Date(video.created_at).toLocaleDateString() : '—'}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

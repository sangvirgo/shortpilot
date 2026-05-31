import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Video,
  FileText,
  Eye,
  Heart,
  UserPlus,
  Sparkles,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { metricsApi, videosApi, draftsApi } from '../api/client';
import VideoCard from '../components/VideoCard';
import StatusBadge from '../components/StatusBadge';

export default function Dashboard() {
  const navigate = useNavigate();

  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['metrics'],
    queryFn: () => metricsApi.summary(),
  });

  const { data: videos } = useQuery({
    queryKey: ['videos'],
    queryFn: () => videosApi.list(),
  });

  const { data: drafts } = useQuery({
    queryKey: ['drafts'],
    queryFn: () => draftsApi.list(),
  });

  const statCards = [
    {
      label: 'Total Videos',
      value: metrics?.total_videos ?? 0,
      icon: Video,
      color: 'text-blue-400 bg-blue-500/10',
    },
    {
      label: 'Drafts',
      value: metrics?.total_drafts ?? 0,
      icon: FileText,
      color: 'text-amber-400 bg-amber-500/10',
    },
    {
      label: 'Views',
      value: metrics?.total_views ?? 0,
      icon: Eye,
      color: 'text-emerald-400 bg-emerald-500/10',
    },
    {
      label: 'Likes',
      value: metrics?.total_likes ?? 0,
      icon: Heart,
      color: 'text-pink-400 bg-pink-500/10',
    },
    {
      label: 'Follows',
      value: metrics?.total_follows ?? 0,
      icon: UserPlus,
      color: 'text-purple-400 bg-purple-500/10',
    },
  ];

  const recentVideos = videos?.slice(0, 6) ?? [];
  const recentDrafts = drafts?.slice(0, 5) ?? [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 mt-1">Your TikTok content factory at a glance</p>
        </div>
        <button
          onClick={() => navigate('/ideas')}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-medium px-5 py-3 rounded-xl transition-colors shadow-lg shadow-purple-600/20"
        >
          <Sparkles className="w-5 h-5" />
          Generate TikTok Package
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Stats */}
      {metricsLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {statCards.map((card) => (
            <div
              key={card.label}
              className="bg-slate-900 rounded-xl border border-slate-800 p-5"
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${card.color}`}
              >
                <card.icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-white">
                {card.value.toLocaleString()}
              </p>
              <p className="text-sm text-slate-400 mt-1">{card.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Recent Videos */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Recent Videos</h2>
          <button
            onClick={() => navigate('/videos')}
            className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
          >
            View all <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        {recentVideos.length === 0 ? (
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-12 text-center">
            <Video className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500">No videos yet. Start by generating ideas!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentVideos.map((v) => (
              <VideoCard key={v.id} video={v} />
            ))}
          </div>
        )}
      </section>

      {/* Recent Drafts */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Recent Drafts</h2>
          <button
            onClick={() => navigate('/drafts')}
            className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
          >
            View all <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        {recentDrafts.length === 0 ? (
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-12 text-center">
            <FileText className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500">No drafts yet. Create captions first!</p>
          </div>
        ) : (
          <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">
                    Hook
                  </th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">
                    Status
                  </th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">
                    Scheduled
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentDrafts.map((d) => (
                  <tr
                    key={d.id}
                    onClick={() => navigate('/drafts')}
                    className="border-b border-slate-800/50 hover:bg-slate-800/30 cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-3 text-sm text-slate-300 truncate max-w-xs">
                      {d.hook}
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={d.status} />
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-400">
                      {d.scheduled_at
                        ? new Date(d.scheduled_at).toLocaleDateString()
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

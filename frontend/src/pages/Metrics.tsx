import { useQuery } from '@tanstack/react-query';
import {
  Loader2,
  Eye,
  Heart,
  UserPlus,
  Video,
  FileText,
  TrendingUp,
} from 'lucide-react';
import { metricsApi } from '../api/client';

function BarChart({ data }: { data: { date: string; follows: number }[] }) {
  if (!data || data.length === 0) return null;

  const max = Math.max(...data.map((d) => d.follows), 1);

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="w-5 h-5 text-purple-400" />
        <h2 className="text-lg font-semibold text-white">Follows Per Post</h2>
      </div>
      <div className="flex items-end gap-2 h-48">
        {data.map((item, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-xs text-slate-400">{item.follows}</span>
            <div
              className="w-full bg-purple-600 rounded-t-md min-h-[4px] transition-all hover:bg-purple-500"
              style={{ height: `${(item.follows / max) * 100}%` }}
            />
            <span className="text-[10px] text-slate-500 truncate w-full text-center">
              {item.date}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RankingTable({
  title,
  icon: Icon,
  items,
  valueLabel,
}: {
  title: string;
  icon: typeof Heart;
  items: { [key: string]: any; follows: number }[];
  valueLabel: string;
}) {
  const keys = items.length > 0 ? Object.keys(items[0]).filter((k) => k !== 'follows') : [];

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-5 h-5 text-purple-400" />
        <h2 className="text-lg font-semibold text-white">{title}</h2>
      </div>
      {items.length === 0 ? (
        <p className="text-slate-500 text-sm">No data yet</p>
      ) : (
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-800">
              <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider pb-2">
                #
              </th>
              {keys.map((k) => (
                <th
                  key={k}
                  className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider pb-2 capitalize"
                >
                  {k}
                </th>
              ))}
              <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider pb-2">
                {valueLabel}
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i} className="border-b border-slate-800/30">
                <td className="py-2.5 text-sm text-slate-500 w-8">{i + 1}</td>
                {keys.map((k) => (
                  <td key={k} className="py-2.5 text-sm text-slate-300">
                    {item[k]}
                  </td>
                ))}
                <td className="py-2.5 text-sm text-right font-medium text-purple-400">
                  {item.follows.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default function Metrics() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['metrics'],
    queryFn: () => metricsApi.summary(),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">Failed to load metrics</p>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Videos',
      value: metrics.total_videos,
      icon: Video,
      color: 'text-blue-400 bg-blue-500/10',
    },
    {
      label: 'Total Drafts',
      value: metrics.total_drafts,
      icon: FileText,
      color: 'text-amber-400 bg-amber-500/10',
    },
    {
      label: 'Total Views',
      value: metrics.total_views,
      icon: Eye,
      color: 'text-emerald-400 bg-emerald-500/10',
    },
    {
      label: 'Total Likes',
      value: metrics.total_likes,
      icon: Heart,
      color: 'text-pink-400 bg-pink-500/10',
    },
    {
      label: 'Total Follows',
      value: metrics.total_follows,
      icon: UserPlus,
      color: 'text-purple-400 bg-purple-500/10',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Metrics</h1>
        <p className="text-slate-400 mt-1">Track your TikTok performance</p>
      </div>

      {/* Summary Cards */}
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

      {/* Chart */}
      <BarChart data={metrics.follows_per_post ?? []} />

      {/* Ranking Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RankingTable
          title="Best Hooks"
          icon={Heart}
          items={metrics.best_hooks ?? []}
          valueLabel="Follows"
        />
        <RankingTable
          title="Best Topics"
          icon={TrendingUp}
          items={metrics.best_topics ?? []}
          valueLabel="Follows"
        />
        <RankingTable
          title="Best Providers"
          icon={Video}
          items={metrics.best_providers ?? []}
          valueLabel="Follows"
        />
      </div>
    </div>
  );
}

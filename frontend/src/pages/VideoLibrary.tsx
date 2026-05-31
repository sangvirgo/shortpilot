import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Film } from 'lucide-react';
import { videosApi } from '../api/client';
import VideoCard from '../components/VideoCard';

const statusFilters = [
  { value: '', label: 'All' },
  { value: 'raw', label: 'Raw' },
  { value: 'rendered', label: 'Rendered' },
  { value: 'captioned', label: 'Captioned' },
  { value: 'drafted', label: 'Drafted' },
  { value: 'posted', label: 'Posted' },
];

export default function VideoLibrary() {
  const [status, setStatus] = useState('');

  const { data: videos, isLoading } = useQuery({
    queryKey: ['videos', status],
    queryFn: () => videosApi.list(status || undefined),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Video Library</h1>
        <p className="text-slate-400 mt-1">Manage your video assets</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {statusFilters.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatus(f.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              status === f.value
                ? 'bg-purple-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
        </div>
      ) : videos && videos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {videos.map((v) => (
            <VideoCard key={v.id} video={v} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <Film className="w-16 h-16 text-slate-700 mx-auto mb-4" />
          <p className="text-slate-500 text-lg">
            {status ? `No ${status} videos found` : 'No videos yet'}
          </p>
        </div>
      )}
    </div>
  );
}

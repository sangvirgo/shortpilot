import { useNavigate } from 'react-router-dom';
import { Play, Clock } from 'lucide-react';
import type { Video } from '../types';
import StatusBadge from './StatusBadge';

export default function VideoCard({ video }: { video: Video }) {
  const navigate = useNavigate();
  const thumbnail = video.thumbnail || video.thumbnail_path || '';
  const duration = video.duration || 0;

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div
      onClick={() => navigate(`/videos/${video.id}`)}
      className="group cursor-pointer bg-slate-900 rounded-xl overflow-hidden border border-slate-800 hover:border-purple-500/50 transition-all hover:shadow-lg hover:shadow-purple-500/10"
    >
      <div className="relative aspect-video bg-slate-800">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={video.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Play className="w-12 h-12 text-slate-600" />
          </div>
        )}
        {duration > 0 && (
          <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/70 rounded px-2 py-1 text-xs text-white">
            <Clock className="w-3 h-3" />
            {formatDuration(duration)}
          </div>
        )}
        <div className="absolute top-2 left-2">
          <StatusBadge status={video.status} />
        </div>
        <div className="absolute inset-0 bg-purple-600/0 group-hover:bg-purple-600/10 transition-colors flex items-center justify-center">
          <Play className="w-10 h-10 text-white opacity-0 group-hover:opacity-80 transition-opacity" />
        </div>
      </div>
      <div className="p-3">
        <h3 className="text-sm font-medium text-slate-200 truncate">
          {video.title || 'Untitled Video'}
        </h3>
        <p className="text-xs text-slate-500 mt-1 capitalize">{video.source_type}</p>
      </div>
    </div>
  );
}

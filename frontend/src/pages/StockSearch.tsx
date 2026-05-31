import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import {
  Search,
  Loader2,
  Download,
  X,
  Film,
  Monitor,
  Smartphone,
} from 'lucide-react';
import { stockApi } from '../api/client';
import { toast } from '../store/toast';
import type { StockVideo } from '../types';

export default function StockSearch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [keywords, setKeywords] = useState(searchParams.get('keywords') ?? '');
  const [provider, setProvider] = useState('');
  const [orientation, setOrientation] = useState('landscape');
  const [results, setResults] = useState<StockVideo[]>([]);
  const [selected, setSelected] = useState<StockVideo | null>(null);

  useEffect(() => {
    const kw = searchParams.get('keywords');
    if (kw && kw !== keywords) {
      setKeywords(kw);
    }
  }, [searchParams]);

  const searchMutation = useMutation({
    mutationFn: () =>
      stockApi.search({
        keywords,
        provider: provider || undefined,
        orientation,
        per_page: 20,
      }),
    onSuccess: (data) => {
      setResults(data);
      toast.success(`Found ${data.length} videos`);
    },
    onError: () => toast.error('Search failed'),
  });

  const downloadMutation = useMutation({
    mutationFn: (video: StockVideo) =>
      stockApi.download({
        url: video.download_url || video.url || '',
        title: video.title,
        provider: video.source_provider || video.provider || '',
        source_url: video.source_url,
        license_note: video.license_note,
      }),
    onSuccess: () => {
      toast.success('Video downloaded to library!');
      setSelected(null);
    },
    onError: () => toast.error('Download failed'),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keywords.trim()) return;
    setSearchParams({ keywords });
    searchMutation.mutate();
  };

  const makeKey = (v: StockVideo, i: number) =>
    v.source_url || v.download_url || `video-${i}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Stock Video Search</h1>
        <p className="text-slate-400 mt-1">Find the perfect footage for your TikTok</p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="bg-slate-900 rounded-xl border border-slate-800 p-6">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="Search keywords..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
          >
            <option value="">Tất cả nguồn</option>
            <option value="pexels">Pexels</option>
            <option value="pixabay">Pixabay</option>
            <option value="mixkit">Mixkit</option>
            <option value="videezy">Videezy</option>
            <option value="coverr">Coverr</option>
          </select>
          <div className="flex bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setOrientation('landscape')}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-sm ${orientation === 'landscape' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              <Monitor className="w-4 h-4" />
              Landscape
            </button>
            <button
              type="button"
              onClick={() => setOrientation('portrait')}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-sm ${orientation === 'portrait' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              <Smartphone className="w-4 h-4" />
              Portrait
            </button>
          </div>
          <button
            type="submit"
            disabled={searchMutation.isPending}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-medium px-5 py-2.5 rounded-lg transition-colors"
          >
            {searchMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            Search
          </button>
        </div>
      </form>

      {/* Results Grid */}
      {results.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {results.map((video, i) => (
            <div
              key={makeKey(video, i)}
              onClick={() => setSelected(video)}
              className="group cursor-pointer bg-slate-900 rounded-xl overflow-hidden border border-slate-800 hover:border-purple-500/50 transition-all"
            >
              <div className="relative aspect-video bg-slate-800">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute top-2 right-2 bg-black/70 text-xs text-white px-2 py-1 rounded capitalize">
                  {video.source_provider || video.provider}
                </div>
                <div className="absolute inset-0 bg-purple-600/0 group-hover:bg-purple-600/10 transition-colors" />
              </div>
              <div className="p-3">
                <h3 className="text-sm font-medium text-slate-200 truncate">
                  {video.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {video.duration}s • {video.width}×{video.height}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {searchMutation.isSuccess && results.length === 0 && (
        <div className="text-center py-16">
          <Film className="w-16 h-16 text-slate-700 mx-auto mb-4" />
          <p className="text-slate-500 text-lg">No videos found. Try different keywords.</p>
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <h3 className="text-lg font-semibold text-white truncate pr-4">
                {selected.title}
              </h3>
              <button
                onClick={() => setSelected(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <div className="aspect-video bg-slate-800 rounded-lg overflow-hidden mb-4">
                <img
                  src={selected.thumbnail}
                  alt={selected.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <span className="text-slate-500">Provider:</span>{' '}
                  <span className="text-slate-200 capitalize">{selected.source_provider || selected.provider}</span>
                </div>
                <div>
                  <span className="text-slate-500">Duration:</span>{' '}
                  <span className="text-slate-200">{selected.duration}s</span>
                </div>
                <div>
                  <span className="text-slate-500">Resolution:</span>{' '}
                  <span className="text-slate-200">
                    {selected.width}×{selected.height}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">License:</span>{' '}
                  <span className="text-slate-200 text-xs">{selected.license_note}</span>
                </div>
              </div>
              <div className="mb-4">
                <span className="text-slate-500 text-sm">Source:</span>{' '}
                <a
                  href={selected.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 text-xs hover:underline break-all"
                >
                  {selected.source_url}
                </a>
              </div>
              <button
                onClick={() => downloadMutation.mutate(selected)}
                disabled={downloadMutation.isPending}
                className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-medium py-3 rounded-lg transition-colors"
              >
                {downloadMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                {downloadMutation.isPending ? 'Downloading...' : 'Download to Library'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

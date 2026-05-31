import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import {
  Loader2,
  Copy,
  Check,
  Captions,
  Hash,
  MessageSquare,
  FileText,
} from 'lucide-react';
import { captionsApi } from '../api/client';
import { toast } from '../store/toast';
import type { CaptionResult } from '../types';

export default function CaptionGenerator() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [niche, setNiche] = useState(searchParams.get('niche') ?? '');
  const [audience, setAudience] = useState('');
  const [hook, setHook] = useState('');
  const [script, setScript] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  const [result, setResult] = useState<CaptionResult | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const generateMutation = useMutation({
    mutationFn: () =>
      captionsApi.generate({
        niche,
        audience,
        hook,
        script,
        video_description: videoDescription,
      }),
    onSuccess: (data) => {
      setResult(data);
      toast.success('Captions generated!');
    },
    onError: () => toast.error('Failed to generate captions'),
  });

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
    toast.success('Copied!');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!niche || !hook) {
      toast.error('Please fill in niche and hook');
      return;
    }
    generateMutation.mutate();
  };

  // Backend returns { captions: [{ caption, hashtags, cta }] }
  const captionItems = result?.captions ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Caption Generator</h1>
        <p className="text-slate-400 mt-1">Generate engaging TikTok captions with AI</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-slate-900 rounded-xl border border-slate-800 p-6 space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Niche *</label>
            <input
              type="text"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              placeholder="e.g. Fitness, Tech, Cooking"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Audience</label>
            <input
              type="text"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              placeholder="e.g. Gen Z, students"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Hook *</label>
            <input
              type="text"
              value={hook}
              onChange={(e) => setHook(e.target.value)}
              placeholder="e.g. Stop making this mistake!"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Video Description</label>
            <input
              type="text"
              value={videoDescription}
              onChange={(e) => setVideoDescription(e.target.value)}
              placeholder="e.g. Screen recording of code"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Script</label>
          <textarea
            value={script}
            onChange={(e) => setScript(e.target.value)}
            placeholder="Brief video script outline..."
            rows={3}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>
        <button
          type="submit"
          disabled={generateMutation.isPending}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-medium px-6 py-2.5 rounded-lg transition-colors"
        >
          {generateMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Captions className="w-4 h-4" />
          )}
          {generateMutation.isPending ? 'Generating...' : 'Generate Captions'}
        </button>
      </form>

      {captionItems.length > 0 && (
        <div className="space-y-4">
          {/* Captions */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Captions className="w-5 h-5 text-purple-400" />
              <h2 className="text-lg font-semibold text-white">Captions ({captionItems.length})</h2>
            </div>
            <div className="space-y-3">
              {captionItems.map((item, i) => (
                <div key={i} className="bg-slate-800/50 rounded-lg p-4 space-y-2">
                  <div className="flex items-start gap-3">
                    <p className="text-sm text-slate-300 flex-1 leading-relaxed whitespace-pre-line">
                      {item.caption}
                    </p>
                    <button
                      onClick={() => handleCopy(item.caption, `caption-${i}`)}
                      className="flex-shrink-0 p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                    >
                      {copied === `caption-${i}` ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {item.hashtags?.map((tag) => (
                      <span key={tag} className="text-xs bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-amber-400">CTA: {item.cta}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Copy all hashtags */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Hash className="w-5 h-5 text-blue-400" />
                <h2 className="text-lg font-semibold text-white">All Hashtags</h2>
              </div>
              <button
                onClick={() => {
                  const allTags = captionItems.flatMap((c) => c.hashtags ?? []);
                  const unique = [...new Set(allTags)];
                  handleCopy(unique.map((t) => `#${t}`).join(' '), 'all-hashtags');
                }}
                className="text-sm text-slate-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-800"
              >
                {copied === 'all-hashtags' ? '✓ Copied' : 'Copy All'}
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[...new Set(captionItems.flatMap((c) => c.hashtags ?? []))].map((tag) => (
                <span
                  key={tag}
                  className="bg-blue-500/10 text-blue-400 border border-blue-500/30 text-sm px-3 py-1 rounded-full cursor-pointer hover:bg-blue-500/20"
                  onClick={() => handleCopy(`#${tag}`, `tag-${tag}`)}
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Create Draft */}
          <button
            onClick={() => {
              const first = captionItems[0];
              navigate(
                `/drafts?hook=${encodeURIComponent(first?.caption?.split('\n')[0] ?? '')}&caption=${encodeURIComponent(first?.caption ?? '')}&hashtags=${encodeURIComponent(first?.hashtags?.join(',') ?? '')}`
              );
            }}
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 rounded-xl transition-colors"
          >
            <FileText className="w-5 h-5" />
            Create Draft from These Captions
          </button>
        </div>
      )}
    </div>
  );
}

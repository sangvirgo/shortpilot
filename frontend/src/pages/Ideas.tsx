import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Lightbulb, Loader2, Sparkles } from 'lucide-react';
import { ideasApi } from '../api/client';
import IdeaCard from '../components/IdeaCard';
import { toast } from '../store/toast';
import type { ContentIdea } from '../types';

export default function Ideas() {
  const [niche, setNiche] = useState('');
  const [audience, setAudience] = useState('');
  const [topic, setTopic] = useState('');
  const [goal, setGoal] = useState('FOLLOW');
  const [generated, setGenerated] = useState<ContentIdea[]>([]);

  const generateMutation = useMutation({
    mutationFn: () =>
      ideasApi.generate({ niche, audience, topic, goal }),
    onSuccess: (data) => {
      setGenerated(data);
      toast.success(`Generated ${data.length} ideas!`);
    },
    onError: () => toast.error('Failed to generate ideas'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!niche || !audience || !topic) {
      toast.error('Please fill in all fields');
      return;
    }
    generateMutation.mutate();
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Content Ideas</h1>
        <p className="text-slate-400 mt-1">
          Generate AI-powered TikTok content ideas
        </p>
      </div>

      {/* Generator Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-slate-900 rounded-xl border border-slate-800 p-6 space-y-5"
      >
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <h2 className="text-lg font-semibold text-white">Idea Generator</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Niche
            </label>
            <input
              type="text"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              placeholder="e.g. Fitness, Cooking, Tech"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Target Audience
            </label>
            <input
              type="text"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              placeholder="e.g. Gen Z, Millennials, Parents"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Topic
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Home workouts, Quick recipes"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Goal
            </label>
            <select
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            >
              <option value="FOLLOW">Follow</option>
              <option value="SAVE">Save</option>
              <option value="COMMENT">Comment</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={generateMutation.isPending}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-medium px-6 py-2.5 rounded-lg transition-colors"
        >
          {generateMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Lightbulb className="w-4 h-4" />
          )}
          {generateMutation.isPending ? 'Generating...' : 'Generate Ideas'}
        </button>
      </form>

      {/* Ideas Grid */}
      {generated.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-white mb-4">
            Generated Ideas ({generated.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {generated.map((idea, i) => (
              <IdeaCard key={`idea-${i}`} idea={idea} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

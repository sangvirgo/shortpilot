import { useNavigate } from 'react-router-dom';
import { Search, Target, Zap } from 'lucide-react';
import type { ContentIdea } from '../types';

const goalIcons: Record<string, typeof Target> = {
  FOLLOW: Target,
  SAVE: Zap,
  COMMENT: Search,
};

const goalColors: Record<string, string> = {
  FOLLOW: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  SAVE: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  COMMENT: 'text-green-400 bg-green-500/10 border-green-500/30',
};

export default function IdeaCard({ idea }: { idea: ContentIdea }) {
  const navigate = useNavigate();
  const goal = idea.goal || 'FOLLOW';
  const niche = idea.niche || '';
  const script = idea.short_script || idea.script || '';
  const keywords = idea.visual_keywords || idea.keywords || [];
  const GoalIcon = goalIcons[goal] ?? Target;

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 hover:border-purple-500/40 transition-all">
      <div className="flex items-start justify-between mb-3">
        <span
          className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${goalColors[goal] ?? goalColors.FOLLOW}`}
        >
          <GoalIcon className="w-3.5 h-3.5" />
          {goal}
        </span>
        {niche && <span className="text-xs text-slate-500">{niche}</span>}
      </div>

      <h3 className="text-base font-semibold text-slate-100 mb-2 leading-snug">
        {idea.hook}
      </h3>

      <p className="text-sm text-slate-400 line-clamp-3 mb-4 leading-relaxed">
        {script}
      </p>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {keywords.map((kw: string) => (
          <span
            key={kw}
            className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-md"
          >
            {kw}
          </span>
        ))}
      </div>

      <button
        onClick={() =>
          navigate(`/stock?keywords=${encodeURIComponent(keywords.join(','))}`)
        }
        className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
      >
        <Search className="w-4 h-4" />
        Find Stock Videos
      </button>
    </div>
  );
}

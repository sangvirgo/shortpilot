import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Lightbulb,
  Film,
  Video,
  Captions,
  FileText,
  Send,
  BarChart3,
  Sparkles,
  Settings as SettingsIcon,
} from 'lucide-react';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/ideas', label: 'Ideas', icon: Lightbulb },
  { to: '/stock', label: 'Stock Search', icon: Film },
  { to: '/videos', label: 'Videos', icon: Video },
  { to: '/captions', label: 'Captions', icon: Captions },
  { to: '/drafts', label: 'Drafts', icon: FileText },
  { to: '/publisher', label: 'Publisher', icon: Send },
  { to: '/metrics', label: 'Metrics', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col min-h-screen">
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-purple-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">ShortPilot</h1>
            <p className="text-xs text-slate-500">TikTok Content Factory</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-purple-600/15 text-purple-400 border border-purple-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <p className="text-xs text-slate-600 text-center">ShortPilot v1.0</p>
      </div>
    </aside>
  );
}

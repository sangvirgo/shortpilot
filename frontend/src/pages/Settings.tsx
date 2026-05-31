import { useState, useEffect } from 'react';
import { Key, Save, Eye, EyeOff, ExternalLink, CheckCircle2 } from 'lucide-react';
import { getStoredKeys, saveKeys, type ApiKeys } from '../store/apiKeys';

export default function Settings() {
  const [keys, setKeys] = useState<ApiKeys>({ gemini: '', pexels: '', pixabay: '' });
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setKeys(getStoredKeys());
  }, []);

  const handleSave = () => {
    saveKeys(keys);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggleShow = (field: string) => {
    setShowKeys((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const mask = (val: string) => {
    if (!val) return '';
    if (val.length <= 8) return '••••••••';
    return val.slice(0, 4) + '••••' + val.slice(-4);
  };

  const fields: { key: keyof ApiKeys; label: string; required: boolean; url: string }[] = [
    {
      key: 'gemini',
      label: 'Gemini API Key',
      required: true,
      url: 'https://aistudio.google.com/apikey',
    },
    {
      key: 'pexels',
      label: 'Pexels API Key',
      required: true,
      url: 'https://www.pexels.com/api/',
    },
    {
      key: 'pixabay',
      label: 'Pixabay API Key',
      required: true,
      url: 'https://pixabay.com/api/docs/',
    },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Key className="w-7 h-7 text-purple-400" />
          API Settings
        </h1>
        <p className="text-slate-400 mt-2">
          Keys are stored in your browser's localStorage. They are sent to the backend with each request via headers.
          Server-side .env keys are used as fallback.
        </p>
      </div>

      <div className="space-y-6">
        {fields.map(({ key, label, required, url }) => (
          <div key={key} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-200">
                {label}
                {required && <span className="text-red-400 ml-1">*</span>}
              </label>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
              >
                Get key <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="relative">
              <input
                type={showKeys[key] ? 'text' : 'password'}
                value={keys[key]}
                onChange={(e) => setKeys((prev) => ({ ...prev, [key]: e.target.value }))}
                placeholder={`Enter your ${label}...`}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 pr-10"
              />
              <button
                type="button"
                onClick={() => toggleShow(key)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showKeys[key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {keys[key] && (
              <p className="text-xs text-slate-500">
                Saved: {mask(keys[key])}
              </p>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={handleSave}
        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
      >
        {saved ? (
          <>
            <CheckCircle2 className="w-5 h-5" />
            Saved!
          </>
        ) : (
          <>
            <Save className="w-5 h-5" />
            Save Keys
          </>
        )}
      </button>

      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-medium text-slate-300">How it works</h3>
        <ul className="text-xs text-slate-500 space-y-1.5">
          <li>• Keys saved here go to your browser's <code className="text-purple-400">localStorage</code></li>
          <li>• Every API request includes keys via <code className="text-purple-400">X-Gemini-Key</code>, <code className="text-purple-400">X-Pexels-Key</code>, <code className="text-purple-400">X-Pixabay-Key</code> headers</li>
          <li>• If no key set here, the server uses its <code className="text-purple-400">.env</code> fallback</li>
          <li>• All 3 services are <strong className="text-slate-300">free</strong> — no credit card needed</li>
        </ul>
      </div>
    </div>
  );
}

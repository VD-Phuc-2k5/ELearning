import { Language, LANGUAGES } from '../constants/languages';

interface LanguageSelectorProps {
  value: Language;
  onChange: (value: Language) => void;
}

export function LanguageSelector({ value, onChange }: LanguageSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-sm font-semibold text-slate-700">Language:</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as Language)}
        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.value} value={lang.value}>
            {lang.label}
          </option>
        ))}
      </select>
    </div>
  );
}

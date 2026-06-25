import { Input } from '../../components/ui';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm font-semibold text-indigo-700">Settings</p>
        <h2 className="mt-1 text-2xl font-semibold text-slate-950">
          Workspace settings
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Configure defaults for the LearningHub interface.
        </p>
      </section>
      <div className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2">
        <Input label="Workspace name" defaultValue="LearningHub" />
        <Input label="Support email" defaultValue="support@learninghub.local" />
      </div>
    </div>
  );
}

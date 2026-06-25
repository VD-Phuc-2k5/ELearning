import { Button, Input } from '../../../components/ui';

export default function CoursesPage() {
  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold text-indigo-700">Courses</p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-950">
            Course catalog
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Organize course content and publishing readiness.
          </p>
        </div>
        <Button>Create course</Button>
      </section>
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <Input label="Filter catalog" placeholder="Find a course" />
      </div>
    </div>
  );
}

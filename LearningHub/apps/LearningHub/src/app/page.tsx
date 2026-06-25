import { Button, Input, Loading } from '../components/ui';

const stats = [
  { label: 'Active learners', value: '1,284', delta: '+12%' },
  { label: 'Published courses', value: '48', delta: '+4' },
  { label: 'Completion rate', value: '86%', delta: '+7%' },
];

const courses = [
  {
    title: 'Product onboarding',
    owner: 'Learning team',
    progress: 76,
    status: 'Live',
  },
  {
    title: 'Security essentials',
    owner: 'Compliance',
    progress: 58,
    status: 'Draft',
  },
  {
    title: 'Customer discovery',
    owner: 'Sales enablement',
    progress: 91,
    status: 'Live',
  },
];

export default function Index() {
  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-indigo-700">Dashboard</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-normal text-slate-950">
            Course operations
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Manage learners, review course health, and keep training programs
            moving across web and mobile layouts.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="secondary">Import learners</Button>
          <Button>Build course</Button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <article
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
            key={stat.label}
          >
            <p className="text-sm font-medium text-slate-500">{stat.label}</p>
            <div className="mt-3 flex items-end justify-between gap-3">
              <strong className="text-3xl font-semibold text-slate-950">
                {stat.value}
              </strong>
              <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
                {stat.delta}
              </span>
            </div>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5">
            <h3 className="text-base font-semibold text-slate-950">
              Recent courses
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              A compact table layout that stays readable on small screens.
            </p>
          </div>
          <div className="divide-y divide-slate-100">
            {courses.map((course) => (
              <article
                className="grid gap-4 p-5 sm:grid-cols-[minmax(0,1fr)_160px_88px] sm:items-center"
                key={course.title}
              >
                <div className="min-w-0">
                  <h4 className="truncate text-sm font-semibold text-slate-950">
                    {course.title}
                  </h4>
                  <p className="mt-1 text-sm text-slate-500">{course.owner}</p>
                </div>
                <div>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full bg-indigo-600"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs font-medium text-slate-500">
                    {course.progress}% complete
                  </p>
                </div>
                <span className="w-fit rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                  {course.status}
                </span>
              </article>
            ))}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-base font-semibold text-slate-950">
              Quick search
            </h3>
            <div className="mt-4 space-y-4">
              <Input
                helperText="Search by course, learner, or team."
                label="Keyword"
                name="keyword"
                placeholder="Security essentials"
              />
              <Button className="w-full">Search</Button>
            </div>
          </div>
          <Loading label="Syncing learner progress" />
        </aside>
      </section>
    </div>
  );
}

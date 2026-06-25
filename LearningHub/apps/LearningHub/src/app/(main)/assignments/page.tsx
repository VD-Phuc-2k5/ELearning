import { Button } from '../../../components/ui';

export default function AssignmentsPage() {
  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm font-semibold text-indigo-700">Assignments</p>
        <h2 className="mt-1 text-2xl font-semibold text-slate-950">
          Learner assignments
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Track required learning by team, role, and due date.
        </p>
      </section>
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <Button>Assign training</Button>
      </div>
    </div>
  );
}

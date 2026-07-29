import { ApiStatus } from "../features/dashboard/ApiStatus";

export function DashboardPage() {
  return (
    <section>
      <header className="page-header">
        <p className="eyebrow">Workspace overview</p>
        <h2>Dashboard</h2>
        <p>Build, test, compare, and govern your AI prompts.</p>
      </header>

      <div className="card">
        <ApiStatus />
      </div>
    </section>
  );
}
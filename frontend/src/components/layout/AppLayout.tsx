import type { PropsWithChildren } from "react";
import { NavLink } from "react-router-dom";

export function AppLayout({ children }: PropsWithChildren) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <h1>Prompt Studio</h1>
          <p>AI prompt development</p>
        </div>

        <nav aria-label="Main navigation">
          <NavLink to="/">Dashboard</NavLink>
          <NavLink to="/prompts">Prompts</NavLink>
          <NavLink to="/comparisons">Comparisons</NavLink>
          <NavLink to="/settings">Settings</NavLink>
        </nav>
      </aside>

      <main className="main-content">{children}</main>
    </div>
  );
}
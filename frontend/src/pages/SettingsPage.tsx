import {
  TagManager,
} from "../features/tags";


export function SettingsPage() {
  return (
    <section className="settings-page">
      <header className="settings-page__header">
        <span className="page-eyebrow">
          Prompt Studio
        </span>

        <h1>Settings</h1>

        <p>
          Manage reusable data and application
          preferences.
        </p>
      </header>

      <div className="settings-page__content">
        <TagManager />
      </div>
    </section>
  );
}
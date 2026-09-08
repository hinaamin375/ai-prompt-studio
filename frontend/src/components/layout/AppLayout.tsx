import {
  type FormEvent,
  type PropsWithChildren,
  useState,
} from "react";

import {
  NavLink,
  useNavigate,
} from "react-router-dom";


type IconName =
  | "overview"
  | "prompts"
  | "collections"
  | "compare"
  | "regression"
  | "providers"
  | "settings"
  | "search";


function NavigationIcon({
  name,
}: {
  name: IconName;
}) {
  const paths: Record<IconName, React.ReactNode> = {
    overview: (
      <>
        <path d="M3 10.8 12 3l9 7.8" />
        <path d="M5.5 9.5V21h13V9.5" />
        <path d="M9.5 21v-6h5v6" />
      </>
    ),
    prompts: (
      <>
        <rect x="4" y="3" width="16" height="18" rx="3" />
        <path d="M8 8h8M8 12h6M8 16h4" />
      </>
    ),
    collections: (
      <>
        <path d="M4 7.5h16v12.5H4z" />
        <path d="M4 7.5 7 4h4l2 3.5" />
      </>
    ),
    compare: (
      <>
        <path d="M7 4v16M17 4v16" />
        <path d="m4 7 3-3 3 3M14 17l3 3 3-3" />
      </>
    ),
    regression: (
      <>
        <path d="M5 20V10M12 20V4M19 20v-7" />
      </>
    ),
    providers: (
      <>
        <path d="m12 3 8 4.5-8 4.5-8-4.5L12 3Z" />
        <path d="m4 12 8 4.5 8-4.5M4 16.5l8 4.5 8-4.5" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21h-4v-.1A1.7 1.7 0 0 0 8.6 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H3v-4h.1A1.7 1.7 0 0 0 4.6 8.6a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V3h4v.1A1.7 1.7 0 0 0 15.4 4.6a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9c.14.36.36.7.66.96.3.26.68.4 1.07.4H21v4h-.1A1.7 1.7 0 0 0 19.4 15Z" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),
  };

  return (
    <svg
      className="product-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}


function BrandMark() {
  return (
    <span className="product-brand-mark" aria-hidden="true">
      <span />
      <span />
      <span />
      <span />
    </span>
  );
}


export function AppLayout({
  children,
}: PropsWithChildren) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  function handleSearchSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const normalizedSearch = searchTerm.trim();

    if (!normalizedSearch) {
      navigate("/prompts");
      return;
    }

    navigate(
      `/prompts?search=${encodeURIComponent(normalizedSearch)}`,
    );
  }

  return (
    <div className="app-shell product-shell">
      <aside className="sidebar product-sidebar">
        <div className="product-sidebar-main">
          <NavLink
            to="/"
            className="product-brand"
            aria-label="AI Prompt Studio home"
          >
            <BrandMark />
            <strong>AI Prompt Studio</strong>
          </NavLink>

          <nav
            className="product-navigation"
            aria-label="Main navigation"
          >
            <div className="product-nav-group">
              <span className="product-nav-label">
                Workspace
              </span>

              <NavLink to="/" end>
                <NavigationIcon name="overview" />
                <span>Overview</span>
              </NavLink>

              <NavLink to="/prompts">
                <NavigationIcon name="prompts" />
                <span>Prompts</span>
              </NavLink>

              <NavLink to="/collections">
                <NavigationIcon name="collections" />
                <span>Collections</span>
              </NavLink>
            </div>

            <div className="product-nav-group">
              <span className="product-nav-label">
                Evaluate
              </span>

              <NavLink to="/comparisons">
                <NavigationIcon name="compare" />
                <span>Comparisons</span>
              </NavLink>

              <NavLink
                to="/prompts"
                className="product-nav-secondary-link"
              >
                <NavigationIcon name="regression" />
                <span>Regression</span>
              </NavLink>
            </div>

            <div className="product-nav-group">
              <span className="product-nav-label">
                Manage
              </span>

              <NavLink
                to="/providers"
                className="product-nav-secondary-link"
              >
                <NavigationIcon name="providers" />
                <span>Model Providers</span>
              </NavLink>

              <NavLink to="/settings">
                <NavigationIcon name="settings" />
                <span>Settings</span>
              </NavLink>
            </div>
          </nav>
        </div>

        <div className="product-sidebar-footer">
          <div className="product-sidebar-quote">
            <span>Better Prompts.</span>
            <span>Greater Possibilities.</span>
          </div>

          <div className="product-workspace-user">
            <span className="product-avatar">HA</span>

            <div>
              <strong>Hina Amin</strong>
              <span>Personal Workspace</span>
            </div>
          </div>
        </div>
      </aside>

      <div className="product-content-shell">
        <header className="product-topbar">
          <form
            className="product-global-search"
            onSubmit={handleSearchSubmit}
            role="search"
          >
            <NavigationIcon name="search" />

            <input
              type="search"
              value={searchTerm}
              placeholder="Search prompts, collections, or runs..."
              aria-label="Search Prompt Studio"
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
            />

            <kbd>⌘ K</kbd>
          </form>

          <div className="product-topbar-account">
            <span className="product-topbar-avatar">HA</span>
          </div>
        </header>

        <main className="main-content product-main-content">
          {children}
        </main>
      </div>
    </div>
  );
}

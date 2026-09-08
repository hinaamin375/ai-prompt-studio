export function EmptyWorkspaceIllustration() {
  return (
    <div
      className="empty-workspace-illustration"
      aria-hidden="true"
    >
      <div className="empty-illustration-window">
        <div className="empty-illustration-sun" />
        <div className="empty-illustration-mountain empty-illustration-mountain--back" />
        <div className="empty-illustration-mountain empty-illustration-mountain--front" />
      </div>

      <div className="empty-illustration-lamp">
        <span />
      </div>

      <div className="empty-illustration-plant">
        <span className="empty-illustration-stem" />
        <span className="empty-illustration-leaf empty-illustration-leaf--1" />
        <span className="empty-illustration-leaf empty-illustration-leaf--2" />
        <span className="empty-illustration-leaf empty-illustration-leaf--3" />
        <span className="empty-illustration-leaf empty-illustration-leaf--4" />
        <span className="empty-illustration-vase" />
      </div>

      <div className="empty-illustration-mug" />

      <div className="empty-illustration-laptop">
        <div className="empty-illustration-laptop-screen">
          <span className="empty-illustration-mini-brand">
            <i />
            <i />
            <i />
            <i />
          </span>
          <small>A better way to work with AI.</small>
        </div>
        <div className="empty-illustration-laptop-base" />
      </div>

      <div className="empty-illustration-books">
        <span>Ideas</span>
        <span>Tests</span>
        <span>Better Prompts</span>
      </div>

      <div className="empty-illustration-note">
        <span>Better</span>
        <span>Prompts</span>
        <span>Greater</span>
        <span>Possibilities.</span>
      </div>
    </div>
  );
}

import React from "react";

function userInitial(name) {
  return String(name || "?").trim().charAt(0).toUpperCase() || "?";
}

function formatRole(role) {
  return String(role || "user")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (ch) => ch.toUpperCase());
}

function Users({
  users,
  loading,
  currentUser,
  canManageRoles,
  onPromote,
  onDemote,
  onDeleteUser,
  onTransferSuperAdmin,
}) {
  const currentUserId = currentUser?.id;
  const superAdmins = users.filter((user) => user.role === "super_admin").length;
  const admins = users.filter((user) => user.role === "admin").length;
  const members = users.filter((user) => user.role === "user").length;

  function renderActions(user) {
    if (!canManageRoles) return <span className="users-view-only">View only</span>;
    if (user.role === "super_admin") return <span className="role-pill protected">Protected</span>;

    const isSelf = user.id === currentUserId;
    return (
      <div className="users-row-actions">
        {user.role === "user" && (
          <button type="button" className="exec-primary-btn small" onClick={() => onPromote(user)}>
            Promote
          </button>
        )}
        {user.role === "admin" && (
          <>
            <button type="button" className="exec-secondary-btn" onClick={() => onDemote(user)}>
              Demote
            </button>
            <button type="button" className="exec-secondary-btn" onClick={() => onTransferSuperAdmin(user)}>
              Make Super Admin
            </button>
          </>
        )}
        {!isSelf && (
          <button type="button" className="exec-secondary-btn" onClick={() => onDeleteUser(user)}>
            Delete
          </button>
        )}
      </div>
    );
  }

  return (
    <section className="page-stack users-page">
      <article className="users-hero page-enter">
        <div className="users-hero-shell">
          <div className="users-hero-copy">
            <h1 className="users-title">Govern workspace access with clean ownership boundaries.</h1>
          </div>

          <div className="users-stats-grid">
            <article className="users-stat-card is-strong">
              <span className="users-stat-label">Super admins</span>
              <strong className="users-stat-value">{superAdmins}</strong>
            </article>
            <article className="users-stat-card">
              <span className="users-stat-label">Admins</span>
              <strong className="users-stat-value">{admins}</strong>
            </article>
            <article className="users-stat-card">
              <span className="users-stat-label">Members</span>
              <strong className="users-stat-value">{members}</strong>
            </article>
            <article className="users-stat-card">
              <span className="users-stat-label">Control state</span>
              <strong className="users-stat-value users-stat-value--text">{canManageRoles ? "Active" : "Read only"}</strong>
            </article>
          </div>
        </div>
      </article>

      <section className="page-section page-enter">
        <article className="users-directory">
          <div className="users-directory-head">
            <div>
              <div className="section-label">Workspace Operators</div>
              <div className="section-title">Team directory</div>
            </div>
            <div className="users-directory-meta">
              <span>{users.length} total users</span>
              <span>{canManageRoles ? "Super admin controls active" : "Read-only access"}</span>
            </div>
          </div>

          {loading && <div className="empty-state">Loading users...</div>}
          {!loading && users.length === 0 && <div className="empty-state">No users found.</div>}

          {!loading && users.length > 0 && (
            <div className="users-list">
              {users.map((user) => (
                <article
                  className={`user-row users-card tone-${String(user.role || "user").replace("_", "-")} ${
                    user.id === currentUserId ? "is-current" : ""
                  }`}
                  key={user.id}
                >
                  <div className="users-card-orb" aria-hidden="true" />

                  <div className="users-identity-block">
                    <div className="user-avatar-sm users-avatar" aria-hidden="true">
                      {userInitial(user.username || user.email)}
                    </div>

                    <div className="user-info users-info">
                      <div className="users-name-line">
                        <div className="user-name">{user.username || "Unknown user"}</div>
                        {user.id === currentUserId && <span className="users-self-badge">You</span>}
                      </div>
                      <div className="user-email">{user.email}</div>
                    </div>
                  </div>

                  <div className="users-role-wrap users-access-rail">
                    <span className={`role-pill ${(user.role || "user").replace("_", "-")}`}>{formatRole(user.role)}</span>
                  </div>

                  <div className="users-actions-wrap">
                    <div className="users-action-dock">{renderActions(user)}</div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </article>
      </section>
    </section>
  );
}

export default Users;

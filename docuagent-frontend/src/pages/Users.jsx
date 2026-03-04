import React from "react";

function Users({ users, loading }) {
  return (
    <section className="page-stack">
      <article className="glass-card panel">
        <h3>Users Management</h3>
        <div className="table-wrap glass-card">
          <table>
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan="3" className="table-empty">
                    Loading users...
                  </td>
                </tr>
              )}
              {!loading && users.length === 0 && (
                <tr>
                  <td colSpan="3" className="table-empty">
                    No users found.
                  </td>
                </tr>
              )}
              {!loading &&
                users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.username || "-"}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`role-badge role-${user.role || "user"}`}>{user.role || "user"}</span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}

export default Users;

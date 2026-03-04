import React from "react";

function Sidebar({ items, currentPage, collapsed, onToggle, onNavigate, onLogout }) {
  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-brand">
        <button className="icon-button" onClick={onToggle} type="button" aria-label="Toggle sidebar">
          {collapsed ? ">" : "<"}
        </button>
        {!collapsed && (
          <div>
            <h2>DocAgent</h2>
            <p>Legal Risk Intelligence</p>
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        {items.map((item) => (
          <button
            key={item.key}
            type="button"
            className={`nav-link ${currentPage === item.key ? "active" : ""}`}
            onClick={() => onNavigate(item.key)}
            title={item.label}
            aria-label={item.label}
          >
            {collapsed ? (
              <span className="nav-icon-pill" aria-hidden="true">
                {item.icon || item.label.slice(0, 2).toUpperCase()}
              </span>
            ) : (
              <span className="nav-label">{item.label}</span>
            )}
          </button>
        ))}
      </nav>

      <button type="button" className="nav-link logout" onClick={onLogout}>
        {!collapsed ? "Logout" : "L"}
      </button>
    </aside>
  );
}

export default Sidebar;

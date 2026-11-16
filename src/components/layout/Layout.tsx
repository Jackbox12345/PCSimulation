import { ui } from "../../styles/ui";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  BookOpen,
  Box,
  ChevronLeft,
  ChevronRight,
  FlaskConical,
  LayoutDashboard,
  Network,
  Settings2,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { usePreferences } from "../../utils/preferences";
const navigation = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/pc-builder", label: "PC Builder", icon: Box, tag: "3D" },
  { to: "/network-lab", label: "Network Lab", icon: Network, tag: "2D" },
  { to: "/guide", label: "Learning Guide", icon: BookOpen },
];
export function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const reduced = usePreferences((s) => s.reducedMotion);
  const title =
    [...navigation, { to: "/settings", label: "Settings" }].find(
      (n) => n.to === location.pathname,
    )?.label || "IT Lab";
  return (
    <div
      className={ui(
        `app-shell ${collapsed ? "sidebar-collapsed" : ""} ${reduced ? "reduce-motion" : ""}`,
      )}
    >
      <aside className={ui("sidebar")}>
        <NavLink className={ui("brand")} to="/" aria-label="IT Lab dashboard">
          <span className={ui("brand-mark")}>
            <FlaskConical size={23} />
          </span>
          <span className={ui("nav-copy")}>
            IT LAB<span className={ui("brand-sub")}>SIMULATOR</span>
          </span>
        </NavLink>
        <div className={ui("nav-section nav-copy")}>WORKSPACE</div>
        <nav>
          {navigation.map(({ to, label, icon: Icon, tag }) => (
            <NavLink
              key={to}
              to={to}
              end
              title={label}
              className={({ isActive }) =>
                ui(`nav-item ${isActive ? "active" : ""}`)
              }
            >
              <Icon size={19} />
              <span className={ui("nav-copy")}>{label}</span>
              {tag && <span className={ui("nav-tag nav-copy")}>{tag}</span>}
            </NavLink>
          ))}
        </nav>
        <div className={ui("sidebar-bottom")}>
          <div className={ui("local-note nav-copy")}>
            <span className={ui("status-dot")} /> Your own learning space
            <p>No accounts. Just curiosity.</p>
          </div>
          <NavLink className={ui("nav-item")} to="/settings" title="Settings">
            <Settings2 size={19} />
            <span className={ui("nav-copy")}>Settings</span>
          </NavLink>
          <button
            className={ui("collapse-button")}
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
          >
            {collapsed ? (
              <ChevronRight size={16} />
            ) : (
              <>
                <ChevronLeft size={16} />
                <span className={ui("nav-copy")}>Collapse sidebar</span>
              </>
            )}
          </button>
        </div>
      </aside>
      <div className={ui("main-shell")}>
        <header className={ui("topbar")}>
          <div>
            <span className={ui("text-muted")}>Workspace</span>
            <span className={ui("breadcrumb")}>/</span>
            {title}
          </div>
          <span className={ui("environment")}>
            <span className={ui("status-dot")} /> Browser sandbox{" "}
            <span className={ui("version")}>v1.0</span>
          </span>
        </header>
        <main className={ui("lab-main")}>
          <Outlet />
        </main>
        <footer className={ui("lab-footer")}>
          <span>
            IT LAB SIMULATOR{" "}
            <span className={ui("text-muted")}>/ Learn by building.</span>
          </span>
          <span>
            <ShieldCheck size={13} /> Runs entirely in your browser
          </span>
        </footer>
      </div>
    </div>
  );
}

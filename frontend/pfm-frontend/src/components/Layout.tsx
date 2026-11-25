import { NavLink, Outlet } from "react-router-dom";
import {
  Wallet,
  LayoutDashboard,
  List,
  PlusCircle,
  ReceiptText,
  ChartNoAxesCombined,
  Target,
  Tags,
  Settings,
  Menu,
  Moon,
  Sun,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import { useFinance, useAppDispatch, logout, toggleTheme } from "../store";
const links = [
  ["/", "Overview", LayoutDashboard],
  ["/transactions", "Transactions", List],
  ["/record", "Record Expense", PlusCircle],
  ["/receipts", "Receipts", ReceiptText],
  ["/budgets", "Budgets", ChartNoAxesCombined],
  ["/goals", "Goals", Target],
  ["/categories", "Categories", Tags],
  ["/settings", "Settings", Settings],
] as const;
export default function Layout() {
  const [open, setOpen] = useState(false);
  const { user, theme, pending } = useFinance();
  const dispatch = useAppDispatch();
  return (
    <div className="shell">
      <aside className={open ? "sidebar open" : "sidebar"}>
        <div className="brand">
          <Wallet size={27} />
          <span>
            Personal
            <br />
            Finance Manager
          </span>
        </div>
        <nav aria-label="Main navigation">
          {links.map(([url, label, Icon]) => (
            <NavLink
              end={url === "/"}
              key={url}
              to={url}
              onClick={() => setOpen(false)}
            >
              <Icon size={19} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          STAGE 3 · FRONT-END
          <br />
          <span>Mock API demonstration</span>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <button
            className="mobile-menu"
            aria-label="Toggle navigation"
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            <Menu />
          </button>
          <span className="top-label">Personal Finance Manager</span>
          <div className="top-actions">
            <button
              aria-label="Toggle theme"
              onClick={() => dispatch(toggleTheme())}
            >
              {theme === "light" ? <Moon size={19} /> : <Sun size={19} />}
            </button>
            <span className="user-name">{user?.name}</span>
            <button
              aria-label="Sign out"
              disabled={pending > 0}
              onClick={() => dispatch(logout())}
            >
              <LogOut size={19} />
            </button>
          </div>
        </header>
        <main id="main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

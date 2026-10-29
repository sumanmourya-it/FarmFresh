
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Sprout,
  Package,
  IndianRupee,
  UserRound,
  Leaf,
  House,
} from "lucide-react";
import "./App.css";

const farmerLinks = [
  { label: "Overview", path: "/farmer", icon: LayoutDashboard },
  { label: "My Products", path: "/farmer/products", icon: Sprout },
  { label: "Orders", path: "/farmer/orders", icon: Package },
  { label: "Earnings", path: "/farmer/earnings", icon: IndianRupee },
  { label: "Farmer Profile", path: "/farmer/profile", icon: UserRound },
];

function FarmerLayout({ children, title, subtitle }) {
  const location = useLocation();

  return (
    <main className="farmer-premium-page">
      <aside className="farmer-sidebar">
        <Link className="farmer-brand" to="/farmer">
          <span className="farmer-brand-icon">
            <Leaf size={27} strokeWidth={1.8} />
          </span>
          <span>
            FarmFresh
            <small>GROWER PORTAL</small>
          </span>
        </Link>

        <div className="farmer-profile">
          <div className="farmer-avatar">
            <Sprout size={25} />
          </div>
          <div>
            <strong>Farmer</strong>
            <small>Farm partner</small>
          </div>
        </div>

        <span className="farmer-menu-label">WORKSPACE</span>

        {farmerLinks.map((item) => {
          const Icon = item.icon;
          const active =
            location.pathname === item.path ||
            (item.path !== "/farmer" &&
              location.pathname.startsWith(item.path));

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`farmer-menu-item ${active ? "active" : ""}`}
            >
              <Icon size={20} strokeWidth={1.8} />
              <span>{item.label}</span>
            </Link>
          );
        })}

        <div className="farmer-sidebar-bottom">
          <div className="farmer-sidebar-tip">
            <Sprout size={27} />
            <strong>Growing together</strong>
            <p>
              Every harvest has a story. Share yours with your customers.
            </p>
          </div>

          <Link to="/" className="farmer-menu-item">
            <House size={20} />
            <span>Back to Home</span>
          </Link>
        </div>
      </aside>

      <div className="farmer-main">
        <header className="farmer-topbar">
          <div>
            <span className="farmer-breadcrumb">
             WORKSPACE / {(title || "Overview").toUpperCase()}
            </span>
            <h1>{title}</h1>
            {subtitle && <p>{subtitle}</p>}
          </div>

          <Link to="/shop" className="farmer-home-link">
            <span>View website</span>
          </Link>
        </header>

        <div className="farmer-page-content">{children}</div>

        <footer className="farmer-dashboard-footer">
          <span>FarmFresh Grower Portal</span>
          <span>Fresh from your farm.</span>
        </footer>
      </div>
    </main>
  );
}

export default FarmerLayout;

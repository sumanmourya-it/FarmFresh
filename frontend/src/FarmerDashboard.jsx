
import { useEffect, useState } from "react";
import {
  Package,
  IndianRupee,
  Store,
  CircleCheck,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import "./App.css";

const API_URL = "http://localhost:8081/api/products";

function FarmerDashboard() {
  const farmerName = "Farmer";
  const [totalProducts, setTotalProducts] = useState(0);

  useEffect(() => {
    async function loadProductCount() {
      try {
        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error("Could not load products");
        }

        const data = await response.json();
        setTotalProducts(data.length);
      } catch (error) {
        console.error("Could not load product count:", error);
      }
    }

    loadProductCount();
  }, []);

  const stats = [
    {
      label: "Total Products",
      value: totalProducts,
      note: "Products in your catalogue",
      icon: Store,
    },
    {
      label: "Orders Received",
      value: "—",
      note: "Order tracking not connected yet",
      icon: Package,
    },
    {
      label: "Total Earnings",
      value: "—",
      note: "Sales tracking not connected yet",
      icon: IndianRupee,
    },
  ];

  return (
    <>
      <section className="farmer-welcome-banner">
        <div className="farmer-welcome-content">
          <span className="farmer-welcome-label">
            <CircleCheck size={15} />
            YOUR FARM, YOUR GROWTH
          </span>

          <h2>Good to see you, {farmerName}.</h2>

          <p>
            Manage your produce and keep track of your farm's activity
            from one place.
          </p>

          <Link
            to="/farmer/products"
            className="farmer-welcome-btn"
          >
            Manage your products
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <section className="farmer-stats-grid">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <article className="farmer-stat-card" key={stat.label}>
              <div className="farmer-stat-top">
                <span>{stat.label}</span>

                <span className="farmer-stat-icon">
                  <Icon size={22} />
                </span>
              </div>

              <strong className="farmer-stat-value">
                {stat.value}
              </strong>

              <small>{stat.note}</small>
            </article>
          );
        })}
      </section>

      <footer className="farmer-dashboard-footer">
        <span>FarmFresh Grower Portal</span>
        <span>Fresh from your farm.</span>
      </footer>
    </>
  );
}

export default FarmerDashboard;

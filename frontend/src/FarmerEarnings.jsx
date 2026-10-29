import { useCallback, useEffect, useState } from "react";
import "./FarmerEarnings.css";

const API_URL = "http://localhost:8081/api/farmer/earnings";
const REFRESH_INTERVAL = 15000; // 15 seconds

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount || 0);
}

function formatDate(date) {
  if (!date) return "—";

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return "—";

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function FarmerEarnings() {
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadEarnings = useCallback(async (showLoading = false) => {
    if (showLoading) {
      setRefreshing(true);
    }

    try {
      const auth = JSON.parse(
        sessionStorage.getItem("farmfreshAuth") || "null"
      );

      if (!auth?.token) {
        throw new Error("Please log in to view your earnings.");
      }

      const response = await fetch(API_URL, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
        cache: "no-store",
      });

      if (response.status === 401) {
        throw new Error("Your session has expired. Please log in again.");
      }

      if (response.status === 403) {
        throw new Error("Only farmer accounts can access this page.");
      }

      if (!response.ok) {
        throw new Error(
          `Unable to load earnings (HTTP ${response.status}).`
        );
      }

      const data = await response.json();

      setEarnings(data);
      setError("");
    } catch (err) {
      setError(err.message || "Unable to load earnings.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadEarnings();

    // Refresh periodically while the page is open.
    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        loadEarnings();
      }
    }, REFRESH_INTERVAL);

    // Refresh when the user returns to this browser tab.
    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        loadEarnings();
      }
    }

    window.addEventListener("focus", handleVisibilityChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleVisibilityChange);
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, [loadEarnings]);

  const monthlyEarnings = earnings?.monthlyEarnings || [];
  const salesHistory = earnings?.salesHistory || [];

  const maxMonthlyEarnings = Math.max(
    ...monthlyEarnings.map((item) => Number(item.earnings) || 0),
    1
  );

  if (loading) {
    return (
      <main className="farmer-earnings-page">
        <div className="earnings-message">Loading your earnings...</div>
      </main>
    );
  }

  if (error && !earnings) {
    return (
      <main className="farmer-earnings-page">
        <div className="earnings-error">
          <h2>Unable to load earnings</h2>
          <p>{error}</p>
          <button onClick={() => loadEarnings(true)}>
            Try Again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="farmer-earnings-page">
      <header className="earnings-header">
        <div>
          <p className="earnings-eyebrow">WORKSPACE / EARNINGS</p>
          <h1>Your Earnings</h1>
          <p>Track your farm sales and income.</p>
        </div>

        <button
          className="earnings-refresh"
          onClick={() => loadEarnings(true)}
          disabled={refreshing}
        >
          {refreshing ? "Refreshing..." : "↻ Refresh"}
        </button>
      </header>

      {error && (
        <p className="earnings-error" role="status">
          Refresh failed: {error}. Showing the last loaded data.
        </p>
      )}

      <section className="earnings-summary">
        <article className="earnings-card earnings-card-primary">
          <span>Total Earnings</span>
          <h2>{formatCurrency(earnings?.totalEarnings)}</h2>
          <p>From delivered orders</p>
        </article>

        <article className="earnings-card">
          <span>This Month</span>
          <h2>{formatCurrency(earnings?.thisMonthEarnings)}</h2>
          <p>Current month's earnings</p>
        </article>

        <article className="earnings-card">
          <span>Products Sold</span>
          <h2>{earnings?.productsSold ?? 0}</h2>
          <p>Units sold in delivered orders</p>
        </article>

        <article className="earnings-card">
          <span>Completed Sales</span>
          <h2>{earnings?.completedSales ?? 0}</h2>
          <p>Orders containing your products</p>
        </article>
      </section>

      <section className="earnings-panel">
        <div className="earnings-panel-heading">
          <div>
            <h2>Monthly Earnings</h2>
            <p>Your earnings over the last six months</p>
          </div>
        </div>

        {monthlyEarnings.length === 0 ? (
          <p className="earnings-empty">No monthly data available.</p>
        ) : (
          <div className="earnings-chart">
            {monthlyEarnings.map((item) => {
              const amount = Number(item.earnings) || 0;
              const height = (amount / maxMonthlyEarnings) * 100;

              return (
                <div className="earnings-chart-column" key={item.month}>
                  <span className="earnings-chart-value">
                    {amount > 0 ? formatCurrency(amount) : "₹0"}
                  </span>

                  <div className="earnings-bar-track">
                    <div
                      className="earnings-bar"
                      style={{
                        height: `${amount > 0 ? Math.max(height, 4) : 0}%`,
                      }}
                      title={formatCurrency(amount)}
                    />
                  </div>

                  <span className="earnings-chart-month">
                    {item.month}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="earnings-panel">
        <div className="earnings-panel-heading">
          <div>
            <h2>Sales History</h2>
            <p>Earnings from your delivered product sales</p>
          </div>
        </div>

        {salesHistory.length === 0 ? (
          <div className="earnings-empty">
            No qualifying sales found yet. Earnings will appear when
            delivered orders contain your products.
          </div>
        ) : (
          <div className="earnings-table-wrapper">
            <table className="earnings-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Order Date</th>
                  <th>Products Sold</th>
                  <th>Your Earnings</th>
                </tr>
              </thead>

              <tbody>
                {salesHistory.map((sale, index) => (
                  <tr key={sale.orderId ?? index}>
                    <td>#{sale.orderId ?? "—"}</td>
                    <td>{formatDate(sale.orderDate)}</td>
                    <td>{sale.productsSold ?? 0}</td>
                    <td className="earnings-amount">
                      {formatCurrency(sale.earnings)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="earnings-note">
        Earnings are calculated from delivered orders containing your
        products. This is a sales total, not necessarily your final profit
        after expenses or platform fees.
      </p>
    </main>
  );
}

import { useCallback, useEffect, useState } from "react";
import "./CustomerOrders.css";

const API_URL = "http://localhost:8081/api/orders";

function formatAmount(amount) {
  return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
}

function formatDate(date) {
  if (!date) return "Date unavailable";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date unavailable";
  }

  return parsedDate.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function getStatusSteps(status) {
  if (status === "Cancelled") {
    return [
      { label: "Pending", dateKey: "orderDate" },
      { label: "Cancelled", dateKey: null },
    ];
  }

  return [
    { label: "Pending", dateKey: "orderDate" },
    { label: "Processing", dateKey: "processingDate" },
    { label: "Shipped", dateKey: "shippedDate" },
    { label: "Delivered", dateKey: "deliveredDate" },
  ];
}

function getAuthData() {
  try {
    const savedAuth = sessionStorage.getItem("farmfreshAuth");
    return savedAuth ? JSON.parse(savedAuth) : null;
  } catch {
    return null;
  }
}

function CustomerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const fetchOrders = useCallback(async () => {
    const auth = getAuthData();
    const token = auth?.token;

    if (!token) {
      setIsLoggedIn(false);
      setOrders([]);
      setLoading(false);
      setError("");
      return;
    }

    setIsLoggedIn(true);
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/customer`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 401 || response.status === 403) {
        throw new Error(
          "Your session may have expired, or your account cannot access customer orders. Please sign in again."
        );
      }

      if (!response.ok) {
        throw new Error("Unable to load your orders. Please try again.");
      }

      const data = await response.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Customer order tracking error:", err);
      setError(
        err.message ||
          "Could not load orders. Please check that the backend is running."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();

    const intervalId = setInterval(() => {
      fetchOrders();
    }, 10000);

    return () => clearInterval(intervalId);
  }, [fetchOrders]);

  return (
    <main className="customer-orders-page">
      <header className="customer-orders-header">
        <a className="customer-orders-back" href="/shop">
          ← Back to Shop
        </a>

        <span className="customer-orders-eyebrow">FARMFRESH</span>
        <h1>My Orders</h1>
        <p>View your purchases and follow their delivery progress.</p>
      </header>

      {!isLoggedIn && !loading && (
        <section className="customer-orders-empty">
          <div>🔐</div>
          <h2>Sign in to track your orders</h2>
          <p>
            Please sign in to your customer account to view your purchases
            and delivery updates.
          </p>
          <a className="customer-orders-back" href="/login">
            Sign In →
          </a>
        </section>
      )}

      {error && (
        <div
          className="customer-orders-message customer-orders-error"
          role="alert"
        >
          {error}
          {(error.includes("session") ||
            error.includes("sign in again")) && (
            <p>
              <a href="/login">Return to sign in</a>
            </p>
          )}
        </div>
      )}

      {loading && (
        <p className="customer-orders-message">
          Loading your orders...
        </p>
      )}

      {!loading &&
        isLoggedIn &&
        !error &&
        orders.length === 0 && (
          <section className="customer-orders-empty">
            <div>📦</div>
            <h2>No orders yet</h2>
            <p>
              When you place an order, its delivery progress will appear here.
            </p>
            <a className="customer-orders-back" href="/shop">
              Explore Products →
            </a>
          </section>
        )}

      {!loading && isLoggedIn && orders.length > 0 && (
        <section className="customer-orders-list">
          <div className="customer-orders-list-heading">
            <h2>Your purchases</h2>
            <span>{orders.length} order(s)</span>
          </div>

          {orders.map((order) => {
            const status = order.status || "Pending";
            const steps = getStatusSteps(status);
            const currentStep = steps.findIndex(
              (step) => step.label === status
            );

            return (
              <article className="customer-order-card" key={order.id}>
                <div className="customer-order-top">
                  <div>
                    <span className="customer-order-label">Order</span>
                    <h3>#{order.id}</h3>
                  </div>

                  <span
                    className={`customer-order-status status-${status.toLowerCase()}`}
                  >
                    {status}
                  </span>
                </div>

                <p className="customer-order-date">
                  Placed: {formatDate(order.orderDate)}
                </p>

                <div className="customer-order-items">
                  {Array.isArray(order.items) && order.items.length > 0 ? (
                    order.items.map((item, index) => (
                      <div
                        className="customer-order-item"
                        key={item.id ?? `${item.productId}-${index}`}
                      >
                        <div>
                          <strong>{item.name || "Product"}</strong>
                          <p>
                            {item.quantity} × {formatAmount(item.price)}
                          </p>
                        </div>

                        <strong>{formatAmount(item.subtotal)}</strong>
                      </div>
                    ))
                  ) : (
                    <p>Product details are unavailable for this order.</p>
                  )}
                </div>

                <div className="customer-order-total">
                  <span>Total amount</span>
                  <strong>{formatAmount(order.total)}</strong>
                </div>

                {status === "Cancelled" ? (
                  <div className="customer-order-cancelled">
                    This order has been cancelled.
                  </div>
                ) : (
                  <div className="customer-order-tracking">
                    <h4>Delivery progress</h4>

                    <div className="customer-tracking-steps">
                      {steps.map((step, index) => {
                        const completed =
                          currentStep >= 0 && index <= currentStep;

                        const timestamp = step.dateKey
                          ? order[step.dateKey]
                          : null;

                        return (
                          <div
                            className={`customer-tracking-step ${
                              completed ? "completed" : ""
                            }`}
                            key={step.label}
                          >
                            <span className="customer-tracking-dot">
                              {completed ? "✓" : index + 1}
                            </span>

                            <span className="customer-tracking-label">
                              {step.label}
                            </span>

                            <small className="customer-tracking-date">
                              {timestamp
                                ? formatDate(timestamp)
                                : completed
                                  ? "Time unavailable"
                                  : "Awaiting update"}
                            </small>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </article>
            );
          })}

          <button
            className="customer-orders-refresh"
            type="button"
            onClick={fetchOrders}
            disabled={loading}
          >
            Refresh Order Status
          </button>
        </section>
      )}
    </main>
  );
}

export default CustomerOrders;

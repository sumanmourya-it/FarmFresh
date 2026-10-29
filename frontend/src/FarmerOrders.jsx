import { useCallback, useEffect, useState } from "react";

const API_URL = "http://localhost:8081/api/orders";

const STATUSES = [
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

const NEXT_STATUSES = {
  Pending: ["Processing", "Cancelled"],
  Processing: ["Shipped", "Cancelled"],
  Shipped: ["Delivered"],
  Delivered: [],
  Cancelled: [],
};

function getAuthToken() {
  const authData = JSON.parse(
    sessionStorage.getItem("farmfreshAuth") || "null"
  );

  if (!authData?.token) {
    throw new Error("Please log in again to access orders.");
  }

  return authData.token;
}

function FarmerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const getStatus = (status) => {
    const value = (status || "Pending").toLowerCase();

    return STATUSES.find((item) => item.toLowerCase() === value) || "Pending";
  };

  // Load orders using the logged-in user's JWT.
  const fetchOrders = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);

    try {
      const token = getAuthToken();

      const response = await fetch(API_URL, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(
          message || `Unable to load orders (${response.status}).`
        );
      }

      const data = await response.json();
      setOrders(Array.isArray(data) ? data : []);
      setError("");
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError(err.message || "Unable to load orders.");
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();

    const intervalId = setInterval(() => {
      fetchOrders(false);
    }, 5000);

    return () => clearInterval(intervalId);
  }, [fetchOrders]);

  // Update the order status in Spring Boot/MySQL using the JWT.
  const updateOrderStatus = async (orderId, newStatus) => {
    const order = orders.find((item) => item.id === orderId);
    if (!order) return;

    const currentStatus = getStatus(order.status);
    const allowedStatuses = NEXT_STATUSES[currentStatus] || [];

    if (!allowedStatuses.includes(newStatus)) {
      setError(`Cannot change an order from ${currentStatus} to ${newStatus}.`);
      return;
    }

    setUpdatingOrderId(orderId);
    setSuccessMessage("");
    setError("");

    try {
      const token = getAuthToken();

      const response = await fetch(`${API_URL}/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(
          message || `Failed to update order status (${response.status}).`
        );
      }

      const updatedOrder = await response.json();

      setOrders((previousOrders) =>
        previousOrders.map((item) =>
          item.id === orderId ? updatedOrder : item
        )
      );

      setSuccessMessage(`Order #${orderId} is now ${newStatus}.`);
      await fetchOrders(false);
    } catch (err) {
      console.error("Error updating order status:", err);
      setError(err.message || "Could not update the order status.");
      await fetchOrders(false);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const getStatusClass = (status) => {
    const value = getStatus(status).toLowerCase();

    if (value === "processing") return "fo-status-processing";
    if (value === "shipped") return "fo-status-shipped";
    if (value === "delivered") return "fo-status-delivered";
    if (value === "cancelled") return "fo-status-cancelled";

    return "fo-status-pending";
  };

  const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    return Number.isNaN(parsedDate.getTime())
      ? "—"
      : parsedDate.toLocaleDateString("en-IN");
  };

  const formatAmount = (amount) =>
    `₹${Number(amount || 0).toLocaleString("en-IN")}`;

  const filteredOrders =
    filter === "All"
      ? orders
      : orders.filter((order) => getStatus(order.status) === filter);

  const totalOrderValue = orders.reduce(
    (sum, order) => sum + Number(order.total ?? order.totalAmount ?? 0),
    0
  );

  const pendingCount = orders.filter(
    (order) => getStatus(order.status) === "Pending"
  ).length;

  const deliveredCount = orders.filter(
    (order) => getStatus(order.status) === "Delivered"
  ).length;

  return (
    <div className="fo-page">
      <div className="fo-header">
        <div>
          <span className="fo-eyebrow">FARMER PORTAL</span>
          <h1>Customer Orders</h1>
          <p>Track and manage orders for your farm products.</p>
        </div>

        <button
          className="fo-refresh-button"
          onClick={() => fetchOrders()}
          disabled={loading || updatingOrderId !== null}
        >
          ↻ {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {successMessage && (
        <div
          role="status"
          style={{
            padding: "12px 16px",
            marginBottom: "16px",
            borderRadius: "8px",
            background: "#e8f5e9",
            color: "#256029",
          }}
        >
          {successMessage}
        </div>
      )}

      {error && (
        <div
          role="alert"
          style={{
            padding: "12px 16px",
            marginBottom: "16px",
            borderRadius: "8px",
            background: "#ffebee",
            color: "#b71c1c",
          }}
        >
          {error}
        </div>
      )}

      <div className="fo-stats">
        <div className="fo-stat-card">
          <span>Total Orders</span>
          <strong>{orders.length}</strong>
          <small>All customer orders</small>
        </div>

        <div className="fo-stat-card">
          <span>Pending</span>
          <strong>{pendingCount}</strong>
          <small>Awaiting processing</small>
        </div>

        <div className="fo-stat-card">
          <span>Delivered</span>
          <strong>{deliveredCount}</strong>
          <small>Successfully delivered</small>
        </div>

        <div className="fo-stat-card">
          <span>Order Value</span>
          <strong>{formatAmount(totalOrderValue)}</strong>
          <small>Total value of loaded orders</small>
        </div>
      </div>

      <div className="fo-orders-panel">
        <div className="fo-panel-header">
          <div>
            <h2>All Orders</h2>
            <p>Review customer purchases and order status.</p>
          </div>

          <select
            className="fo-filter"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            aria-label="Filter orders by status"
          >
            <option value="All">All Statuses</option>
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="fo-message">Loading orders...</div>
        ) : error && orders.length === 0 ? (
          <div className="fo-message">
            <p>{error}</p>
            <button className="fo-refresh-button" onClick={() => fetchOrders()}>
              Try Again
            </button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="fo-empty">
            <div className="fo-empty-icon">📦</div>
            <h3>No orders found</h3>
            <p>
              {orders.length === 0
                ? "Customer orders will appear here when available."
                : "No orders match the selected status. Try another filter."}
            </p>
          </div>
        ) : (
          <div className="fo-table-wrapper">
            <table className="fo-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Order Date</th>
                  <th>Items</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {filteredOrders.map((order, index) => {
                  const currentStatus = getStatus(order.status);
                  const nextStatuses = NEXT_STATUSES[currentStatus] || [];

                  return (
                    <tr key={order.id ?? index}>
                      <td className="fo-order-id">#{order.id ?? "—"}</td>

                      <td>
                        <strong>
                          {order.name || order.customerName || "Customer"}
                        </strong>
                        {order.email && (
                          <div className="fo-customer-email">{order.email}</div>
                        )}
                      </td>

                      <td>
                        <div>
                          <strong>{formatDate(order.orderDate)}</strong>
                        </div>
                        {order.orderDate &&
                          !Number.isNaN(new Date(order.orderDate).getTime()) && (
                            <div className="fo-customer-email">
                              {new Date(order.orderDate).toLocaleTimeString(
                                "en-IN",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: true,
                                }
                              )}
                            </div>
                          )}
                      </td>

                      <td>
                        {Array.isArray(order.items) && order.items.length > 0 ? (
                          <div>
                            {order.items.map((item, itemIndex) => (
                              <div
                                key={item.id ?? itemIndex}
                                style={{
                                  marginBottom: "10px",
                                  paddingBottom: "8px",
                                  borderBottom:
                                    itemIndex < order.items.length - 1
                                      ? "1px solid #e5e7eb"
                                      : "none",
                                }}
                              >
                                <strong>{item.name || "Unnamed Product"}</strong>
                                <div className="fo-customer-email">
                                  {item.quantity} × {formatAmount(item.price)}
                                </div>
                                <div className="fo-customer-email">
                                  Subtotal: {formatAmount(item.subtotal)}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span>No item details</span>
                        )}
                      </td>

                      <td className="fo-amount">{formatAmount(order.total)}</td>

                      <td>
                        <div>
                          <span
                            className={`fo-status ${getStatusClass(currentStatus)}`}
                          >
                            {currentStatus}
                          </span>

                          {nextStatuses.length > 0 && (
                            <div className="fo-order-actions">
                              {nextStatuses.map((status) => {
                                const buttonLabels = {
                                  Processing: "Accept Order",
                                  Shipped: "Dispatch Order",
                                  Delivered: "Confirm Delivery",
                                  Cancelled: "Cancel Order",
                                };

                                return (
                                  <button
                                    key={status}
                                    type="button"
                                    className={`fo-action-button fo-action-${status.toLowerCase()}`}
                                    disabled={
                                      updatingOrderId !== null || order.id == null
                                    }
                                    onClick={() =>
                                      updateOrderStatus(order.id, status)
                                    }
                                  >
                                    {updatingOrderId === order.id
                                      ? "Saving..."
                                      : buttonLabels[status]}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="fo-footer">
        FarmFresh Farmer Portal · Growing better, together.
      </p>
    </div>
  );
}

export default FarmerOrders;

import { useEffect, useState } from "react";

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://localhost:8081/api/orders")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load orders");
        }
        return response.json();
      })
      .then((data) => {
        setOrders(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Order Error:", error);
        setError("Could not load orders. Make sure Spring Boot is running.");
        setLoading(false);
      });
  }, []);

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>📦 FarmFresh Admin</h1>
        <p>Customer Orders</p>
      </div>

      <div className="admin-container">
        <h2>All Orders</h2>

        {loading && <p>Loading orders...</p>}

        {error && <p className="admin-error">{error}</p>}

        {!loading && !error && orders.length === 0 && (
          <p>No orders found.</p>
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="orders-table-wrapper">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Customer</th>
                  <th>Mobile</th>
                  <th>City</th>
                  <th>Payment</th>
                  <th>Total</th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td>
                      <strong>{order.name}</strong>
                      <br />
                      <small>{order.email}</small>
                    </td>
                    <td>{order.mobile}</td>
                    <td>{order.city}</td>
                    <td>{order.payment}</td>
                    <td>₹{order.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <button
        className="admin-back-btn"
        onClick={() => {
          window.location.href = "/";
        }}
      >
        ← Back to FarmFresh
      </button>
    </div>
  );
}

export default AdminOrders;
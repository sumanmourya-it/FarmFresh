
import { useCallback, useEffect, useState } from "react";
import "./AdminOrders.css";

const API_URL = "http://localhost:8081/api";

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [assignments, setAssignments] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingProduct, setSavingProduct] = useState(null);
  const [processingApproval, setProcessingApproval] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [activeTab, setActiveTab] = useState("products");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const getToken = () => {
    try {
      const auth = JSON.parse(
        sessionStorage.getItem("farmfreshAuth") || "{}"
      );
      return auth.token || "";
    } catch {
      return "";
    }
  };

  const authHeaders = () => ({
    Authorization: `Bearer ${getToken()}`,
    "Content-Type": "application/json",
  });

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token = getToken();

      if (!token) {
        throw new Error(
          "Please sign in again with your Admin account."
        );
      }

      const headers = { Authorization: `Bearer ${token}` };

      const [
        ordersResponse,
        productsResponse,
        farmersResponse,
      ] = await Promise.all([
        fetch(`${API_URL}/orders`, { headers }),
        fetch(`${API_URL}/admin/products`, { headers }),
        fetch(`${API_URL}/admin/farmers`, { headers }),
      ]);

      if (!ordersResponse.ok) {
        throw new Error(
          `Could not load orders (${ordersResponse.status}).`
        );
      }

      if (!productsResponse.ok) {
        throw new Error(
          `Could not load products (${productsResponse.status}).`
        );
      }

      if (!farmersResponse.ok) {
        throw new Error(
          farmersResponse.status === 401 ||
          farmersResponse.status === 403
            ? "Admin authentication failed. Please sign in again."
            : `Could not load farmers (${farmersResponse.status}).`
        );
      }

      const [
        ordersData,
        productsData,
        farmersData,
      ] = await Promise.all([
        ordersResponse.json(),
        productsResponse.json(),
        farmersResponse.json(),
      ]);

      const safeProducts = Array.isArray(productsData)
        ? productsData
        : [];

      setOrders(Array.isArray(ordersData) ? ordersData : []);
      setProducts(safeProducts);
      setFarmers(Array.isArray(farmersData) ? farmersData : []);

      setAssignments((previous) => {
        const next = { ...previous };

        safeProducts.forEach((product) => {
          if (next[product.id] === undefined) {
            next[product.id] =
              product.farmerId ?? product.farmer?.id
                ? String(product.farmerId ?? product.farmer?.id)
                : "";
          }
        });

        return next;
      });
    } catch (err) {
      console.error("Admin dashboard error:", err);

      setError(
        err instanceof TypeError
          ? "Cannot connect to the backend. Check that Spring Boot is running on port 8081."
          : err.message || "Could not load the Admin dashboard."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  async function assignProduct(product) {
    const farmerId = assignments[product.id];

    if (!farmerId) {
      setError("Please select a farmer first.");
      setNotice("");
      return;
    }

    const farmer = farmers.find(
      (item) => String(item.id) === String(farmerId)
    );

    if (!farmer) {
      setError("Please select a valid farmer.");
      setNotice("");
      return;
    }

    setSavingProduct(product.id);
    setError("");
    setNotice("");

    try {
      const response = await fetch(
        `${API_URL}/products/${product.id}/assign-farmer?farmerId=${encodeURIComponent(
          farmerId
        )}`,
        {
          method: "PUT",
          headers: authHeaders(),
        }
      );

      if (!response.ok) {
        const message = await response.text();
        throw new Error(
          message || `Assignment failed (${response.status}).`
        );
      }

      setNotice(
        `${product.name} assigned to ${farmer.fullName} successfully.`
      );

      await loadDashboard();
    } catch (err) {
      console.error("Product assignment error:", err);
      setError(
        err instanceof TypeError
          ? "Cannot connect to the backend."
          : err.message || "Could not assign this product."
      );
    } finally {
      setSavingProduct(null);
    }
  }

  async function changeApproval(product, action) {
    setProcessingApproval(product.id);
    setError("");
    setNotice("");

    try {
      const response = await fetch(
        `${API_URL}/admin/products/${product.id}/${action}`,
        {
          method: "PUT",
          headers: authHeaders(),
        }
      );

      if (!response.ok) {
        const message = await response.text();

        throw new Error(
          message ||
          `Could not ${action} product (${response.status}).`
        );
      }

      setNotice(
        action === "approve"
          ? `${product.name} approved successfully. Customers can now see it.`
          : `${product.name} rejected. It will not appear in the customer shop.`
      );

      await loadDashboard();
    } catch (err) {
      console.error("Product approval error:", err);

      setError(
        err instanceof TypeError
          ? "Cannot connect to the backend."
          : err.message || `Could not ${action} this product.`
      );
    } finally {
      setProcessingApproval(null);
    }
  }

  const money = (value) =>
    `₹${Number(value ?? 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const getStatus = (product) =>
    String(product.approvalStatus || "PENDING").toUpperCase();

  const pendingCount = products.filter(
    (product) => getStatus(product) === "PENDING"
  ).length;

  const approvedCount = products.filter(
    (product) => getStatus(product) === "APPROVED"
  ).length;

  const rejectedCount = products.filter(
    (product) => getStatus(product) === "REJECTED"
  ).length;

  const assignedCount = products.filter((product) =>
    farmers.some(
      (farmer) =>
        String(farmer.id) ===
        String(
          product.farmerId ?? product.farmer?.id ?? ""
        )
    )
  ).length;

  const filteredProducts = products.filter((product) =>
    statusFilter === "ALL"
      ? true
      : getStatus(product) === statusFilter
  );

  return (
    <main className="admin-page">
      <header className="admin-header">
        <div>
          <p className="admin-eyebrow">
            FARMFRESH MANAGEMENT
          </p>

          <h1>FarmFresh Admin</h1>

          <p>
            Manage products, approve farmer listings, and track orders.
          </p>
        </div>

        <button
          type="button"
          className="admin-back-btn"
          onClick={() => {
            window.location.href = "/";
          }}
        >
          ← Back to FarmFresh
        </button>
      </header>

      <section className="admin-stats">
        <article className="admin-stat-card">
          <span>Total orders</span>
          <strong>{orders.length}</strong>
        </article>

        <article className="admin-stat-card">
          <span>Total products</span>
          <strong>{products.length}</strong>
        </article>

        <article className="admin-stat-card">
          <span>Pending approval</span>
          <strong>{pendingCount}</strong>
        </article>

        <article className="admin-stat-card">
          <span>Approved products</span>
          <strong>{approvedCount}</strong>
        </article>

        <article className="admin-stat-card">
          <span>Farmer accounts</span>
          <strong>{farmers.length}</strong>
        </article>

        <article className="admin-stat-card">
          <span>Products assigned</span>
          <strong>{assignedCount}</strong>
        </article>
      </section>

      <section className="admin-container">
        <div className="admin-toolbar">
          <div>
            <h2>Management</h2>
            <p>
              Review products and manage customer orders.
            </p>
          </div>

          <button
            type="button"
            className="admin-refresh-btn"
            onClick={loadDashboard}
            disabled={loading}
          >
            {loading ? "Loading..." : "↻ Refresh"}
          </button>
        </div>

        <div className="admin-tabs">
          <button
            type="button"
            className={activeTab === "products" ? "active" : ""}
            onClick={() => setActiveTab("products")}
          >
            Products & approvals
            {pendingCount > 0 && ` (${pendingCount} pending)`}
          </button>

          <button
            type="button"
            className={activeTab === "orders" ? "active" : ""}
            onClick={() => setActiveTab("orders")}
          >
            Customer orders
          </button>
        </div>

        {error && (
          <div
            className="admin-message admin-error"
            role="alert"
          >
            {error}
          </div>
        )}

        {notice && (
          <div
            className="admin-message admin-success"
            role="status"
          >
            {notice}
          </div>
        )}

        {loading ? (
          <p className="admin-empty">
            Loading Admin dashboard...
          </p>
        ) : activeTab === "products" ? (
          <>
            <div className="admin-section-heading">
              <div>
                <h3>Product approval and assignments</h3>
                <p>
                  Approve pending products before they appear in the shop.
                </p>
              </div>
            </div>

            <div className="admin-product-filters">
              <button
                type="button"
                className={statusFilter === "ALL" ? "active" : ""}
                onClick={() => setStatusFilter("ALL")}
              >
                All ({products.length})
              </button>

              <button
                type="button"
                className={statusFilter === "PENDING" ? "active" : ""}
                onClick={() => setStatusFilter("PENDING")}
              >
                Pending ({pendingCount})
              </button>

              <button
                type="button"
                className={statusFilter === "APPROVED" ? "active" : ""}
                onClick={() => setStatusFilter("APPROVED")}
              >
                Approved ({approvedCount})
              </button>

              <button
                type="button"
                className={statusFilter === "REJECTED" ? "active" : ""}
                onClick={() => setStatusFilter("REJECTED")}
              >
                Rejected ({rejectedCount})
              </button>
            </div>

            {filteredProducts.length === 0 ? (
              <p className="admin-empty">
                No products found in this category.
              </p>
            ) : (
              <div className="orders-table-wrapper">
                <table className="orders-table admin-products-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Quantity</th>
                      <th>Approval status</th>
                      <th>Current farmer</th>
                      <th>Assign farmer</th>
                      <th>Assignment</th>
                      <th>Review action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredProducts.map((product) => {
                      const currentFarmer = farmers.find(
                        (farmer) =>
                          String(farmer.id) ===
                          String(
                            product.farmerId ??
                            product.farmer?.id ??
                            ""
                          )
                      );

                      const status = getStatus(product);

                      return (
                        <tr key={product.id}>
                          <td>
                            <strong>{product.name}</strong>
                            <br />
                            <small>Product #{product.id}</small>
                            {product.description && (
                              <>
                                <br />
                                <small>{product.description}</small>
                              </>
                            )}
                          </td>

                          <td>{product.category || "—"}</td>

                          <td>{money(product.price)}</td>

                          <td>{product.quantity ?? "—"}</td>

                          <td>
                            <span
                              className={`admin-status admin-status-${status.toLowerCase()}`}
                            >
                              {status}
                            </span>
                          </td>

                          <td>
                            {currentFarmer
                              ? currentFarmer.fullName
                              : "Unassigned"}
                          </td>

                          <td>
                            <select
                              aria-label={`Assign ${product.name} to farmer`}
                              value={assignments[product.id] ?? ""}
                              onChange={(event) =>
                                setAssignments((previous) => ({
                                  ...previous,
                                  [product.id]: event.target.value,
                                }))
                              }
                            >
                              <option value="">
                                Select farmer
                              </option>

                              {farmers.map((farmer) => (
                                <option
                                  key={farmer.id}
                                  value={String(farmer.id)}
                                >
                                  {farmer.fullName} ({farmer.email})
                                </option>
                              ))}
                            </select>
                          </td>

                          <td>
                            <button
                              type="button"
                              className="admin-assign-btn"
                              onClick={() => assignProduct(product)}
                              disabled={
                                savingProduct === product.id ||
                                !assignments[product.id]
                              }
                            >
                              {savingProduct === product.id
                                ? "Saving..."
                                : "Save assignment"}
                            </button>
                          </td>

                          <td>
                            {status === "PENDING" ? (
                              <div className="admin-review-actions">
                                <button
                                  type="button"
                                  className="admin-approve-btn"
                                  onClick={() =>
                                    changeApproval(product, "approve")
                                  }
                                  disabled={
                                    processingApproval === product.id
                                  }
                                >
                                  {processingApproval === product.id
                                    ? "Please wait..."
                                    : "Approve"}
                                </button>

                                <button
                                  type="button"
                                  className="admin-reject-btn"
                                  onClick={() =>
                                    changeApproval(product, "reject")
                                  }
                                  disabled={
                                    processingApproval === product.id
                                  }
                                >
                                  Reject
                                </button>
                              </div>
                            ) : status === "APPROVED" ? (
                              <span>Available in shop</span>
                            ) : (
                              <span>Not available in shop</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : (
          <>
            <h3>All customer orders</h3>

            {orders.length === 0 ? (
              <p className="admin-empty">
                No orders found.
              </p>
            ) : (
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
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id}>
                        <td>#{order.id}</td>

                        <td>
                          <strong>{order.name || "—"}</strong>
                          <br />
                          <small>{order.email || ""}</small>
                        </td>

                        <td>{order.mobile || "—"}</td>
                        <td>{order.city || "—"}</td>
                        <td>{order.payment || "—"}</td>
                        <td>{money(order.total)}</td>
                        <td>{order.status || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}

export default AdminOrders;

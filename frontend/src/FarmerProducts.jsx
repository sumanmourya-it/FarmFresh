
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  RefreshCw,
  Sprout,
  Pencil,
  Trash2,
  Package,
  Search,
  ArrowUpRight,
  SlidersHorizontal,
  X,
} from "lucide-react";
import "./App.css";

const API_URL = "http://localhost:8081/api/products";
const MY_PRODUCTS_URL = `${API_URL}/farmer/mine`;

function getAuthHeaders() {
  const auth = JSON.parse(
    sessionStorage.getItem("farmfreshAuth") || "null"
  );

  return {
    Authorization: `Bearer ${auth?.token || ""}`,
    "Content-Type": "application/json",
  };
}

function FarmerProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [stockFilter, setStockFilter] = useState("All");
  const [sortBy, setSortBy] = useState("name-asc");

  
    async function loadProducts() {
  setLoading(true);
  setError("");

  try {
    const response = await fetch(MY_PRODUCTS_URL, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error(
          "Your session may have expired. Please log in again."
        );
      }

      throw new Error("Failed to load your products.");
    }

    const data = await response.json();
    setProducts(data);
  } catch (error) {
    setError(
      error.message ||
        "Unable to load products. Check that Spring Boot and MySQL are running."
    );
  } finally {
    setLoading(false);
  }
}

  useEffect(() => {
    loadProducts();
  }, []);

  async function deleteProduct(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) return;

    setError("");

    try {
      const response = await fetch(`${API_URL}/${id}`, {
  method: "DELETE",
  headers: getAuthHeaders(),
});

      if (!response.ok) throw new Error("Delete failed.");

      setProducts((current) =>
        current.filter((product) => product.id !== id)
      );
    } catch {
      setError("Could not delete this product. Please try again.");
    }
  }

  const categories = [
    "All",
    ...new Set(products.map((product) => product.category || "Other")),
  ];

  const filteredProducts = products
    .filter((product) => {
      const matchesSearch = (product.name || "")
        .toLowerCase()
        .includes(search.trim().toLowerCase());

      const matchesCategory =
        category === "All" ||
        (product.category || "Other") === category;

      const quantity = Number(product.quantity || 0);

      const matchesStock =
        stockFilter === "All" ||
        (stockFilter === "In stock" && quantity > 0) ||
        (stockFilter === "Out of stock" && quantity <= 0);

      return matchesSearch && matchesCategory && matchesStock;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name-desc":
          return (b.name || "").localeCompare(a.name || "");
        case "price-asc":
          return Number(a.price || 0) - Number(b.price || 0);
        case "price-desc":
          return Number(b.price || 0) - Number(a.price || 0);
        case "stock-asc":
          return Number(a.quantity || 0) - Number(b.quantity || 0);
        case "stock-desc":
          return Number(b.quantity || 0) - Number(a.quantity || 0);
        default:
          return (a.name || "").localeCompare(b.name || "");
      }
    });

  const totalStock = products.reduce(
    (total, product) => total + Number(product.quantity || 0),
    0
  );

  function clearFilters() {
    setSearch("");
    setCategory("All");
    setStockFilter("All");
    setSortBy("name-asc");
  }

  const hasActiveFilters =
    search.trim() !== "" ||
    category !== "All" ||
    stockFilter !== "All" ||
    sortBy !== "name-asc";

  return (
    <div className="fp-page">
      <section className="fp-heading">
        <div>
          <span className="fp-eyebrow">INVENTORY MANAGEMENT</span>
          <h2>My Products</h2>
          <p>Manage your produce, stock and prices in one place.</p>
        </div>

        <Link to="/farmer/products/add" className="fp-add-button">
          <Plus size={18} />
          Add New Product
        </Link>
      </section>

      <section className="fp-stats">
        <article className="fp-stat-card">
          <span className="fp-stat-icon">
            <Package size={21} />
          </span>
          <div>
            <p>Total Products</p>
            <h3>{products.length}</h3>
            <span>Products listed</span>
          </div>
        </article>

        <article className="fp-stat-card">
          <span className="fp-stat-icon">
            <Sprout size={21} />
          </span>
          <div>
            <p>Total Stock</p>
            <h3>{totalStock}</h3>
            <span>Units available</span>
          </div>
        </article>

        <article className="fp-stat-card">
          <span className="fp-stat-icon">
            <ArrowUpRight size={21} />
          </span>
          <div>
            <p>Categories</p>
            <h3>{Math.max(categories.length - 1, 0)}</h3>
            <span>Product categories</span>
          </div>
        </article>
      </section>

      <section className="fp-catalogue">
        <div className="fp-catalogue-heading">
          <div>
            <h3>Product Catalogue</h3>
            <p>View and manage all your listed products.</p>
          </div>

          <button
            type="button"
            className="fp-refresh-button"
            onClick={loadProducts}
            disabled={loading}
          >
            <RefreshCw size={16} />
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        <div className="fp-toolbar">
          <div className="fp-search">
            <Search size={18} />
            <input
              type="search"
              placeholder="Search products..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search products"
            />
          </div>

          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            aria-label="Filter by category"
            className="fp-category-select"
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item === "All" ? "All Categories" : item}
              </option>
            ))}
          </select>
        </div>

        <div className="fp-advanced-toolbar">
          <div className="fp-filter-label">
            <SlidersHorizontal size={17} />
            <span>Filter and sort</span>
          </div>

          <div className="fp-advanced-controls">
            <select
              value={stockFilter}
              onChange={(event) => setStockFilter(event.target.value)}
              aria-label="Filter by stock"
              className="fp-category-select"
            >
              <option value="All">All Stock</option>
              <option value="In stock">In Stock</option>
              <option value="Out of stock">Out of Stock</option>
            </select>

            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              aria-label="Sort products"
              className="fp-category-select"
            >
              <option value="name-asc">Name: A to Z</option>
              <option value="name-desc">Name: Z to A</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="stock-asc">Stock: Low to High</option>
              <option value="stock-desc">Stock: High to Low</option>
            </select>

            {hasActiveFilters && (
              <button
                type="button"
                className="fp-clear-button"
                onClick={clearFilters}
              >
                <X size={15} />
                Clear
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="fp-error" role="alert">
            {error}
            <button type="button" onClick={loadProducts}>
              Try again
            </button>
          </div>
        )}

        {loading ? (
          <div className="fp-empty">
            <RefreshCw size={25} />
            <p>Loading your products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="fp-empty">
            <span className="fp-empty-icon">
              <Sprout size={30} />
            </span>

            <h4>
              {products.length === 0
                ? "Your catalogue is ready"
                : "No matching products"}
            </h4>

            <p>
              {products.length === 0
                ? "Add your first product to start building your farm catalogue."
                : "Try changing your search or filters."}
            </p>

            {products.length === 0 ? (
              <Link
                to="/farmer/products/add"
                className="fp-add-button"
              >
                <Plus size={17} />
                Add Your First Product
              </Link>
            ) : (
              <button
                type="button"
                className="fp-clear-button"
                onClick={clearFilters}
              >
                <X size={15} />
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="fp-table-wrap">
            <table className="fp-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <div className="fp-product-name">
                        <span className="fp-product-icon">
                          <Sprout size={19} />
                        </span>
                        <strong>{product.name}</strong>
                      </div>
                    </td>

                    <td>
                      <span className="fp-category-badge">
                        {product.category || "Other"}
                      </span>
                    </td>

                    <td className="fp-price">
                      ₹{Number(product.price || 0).toFixed(2)}
                    </td>

                    <td>{product.quantity ?? 0}</td>

                    <td>
                      <span
                        className={
                          Number(product.quantity || 0) > 0
                            ? "fp-status fp-in-stock"
                            : "fp-status fp-out-stock"
                        }
                      >
                        {Number(product.quantity || 0) > 0
                          ? "In stock"
                          : "Out of stock"}
                      </span>
                    </td>

                    <td>
                      <div className="fp-row-actions">
                        <Link
                          to={`/farmer/products/edit/${product.id}`}
                          className="fp-icon-button"
                          aria-label={`Edit ${product.name}`}
                          title="Edit product"
                        >
                          <Pencil size={16} />
                        </Link>

                        <button
                          type="button"
                          className="fp-icon-button fp-delete-button"
                          onClick={() => deleteProduct(product.id)}
                          aria-label={`Delete ${product.name}`}
                          title="Delete product"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="fp-catalogue-footer">
          Showing {filteredProducts.length} of {products.length} products
        </div>
      </section>
    </div>
  );
}

export default FarmerProducts;

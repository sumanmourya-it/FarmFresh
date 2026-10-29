
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  PackagePlus,
  Leaf,
  IndianRupee,
  Boxes,
  FileText,
} from "lucide-react";
import "./App.css";

const API_URL = "http://localhost:8081/api/products";

function FarmerEditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    category: "Vegetables",
    price: "",
    quantity: "",
    description: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProduct() {
      try {
        const response = await fetch(`${API_URL}/${id}`);

        if (!response.ok) {
          throw new Error("Product not found.");
        }

        const product = await response.json();

        setForm({
          name: product.name ?? "",
          category: product.category ?? "Vegetables",
          price: product.price ?? "",
          quantity: product.quantity ?? "",
          description: product.description ?? "",
        });
      } catch {
        setError(
          "Could not load this product. Check your backend or product ID."
        );
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [id]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (
      !form.name.trim() ||
      form.price === "" ||
      form.quantity === "" ||
      Number(form.price) <= 0 ||
      Number(form.quantity) < 0
    ) {
      setError(
        "Enter a product name, a price above ₹0, and a valid stock quantity."
      );
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
       headers: {
  "Content-Type": "application/json",
  Authorization: `Bearer ${
    JSON.parse(sessionStorage.getItem("farmfreshAuth") || "null")?.token || ""
  }`,
},
        body: JSON.stringify({
          name: form.name.trim(),
          category: form.category,
          price: Number(form.price),
          quantity: Number(form.quantity),
          description: form.description.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Could not update product.");
      }

      navigate("/farmer/products");
    } catch {
      setError(
        "Could not update the product. Check the backend and try again."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <section className="fap-card">
        <div className="fap-empty">
          <p>Loading product details...</p>
        </div>
      </section>
    );
  }

  return (
    <div className="fap-page">
      <div className="fap-back-row">
        <Link to="/farmer/products" className="fap-back-link">
          <ArrowLeft size={17} />
          Back to My Products
        </Link>
      </div>

      <section className="fap-card">
        <div className="fap-heading">
          <div className="fap-heading-icon">
            <PackagePlus size={27} />
          </div>

          <span className="fap-eyebrow">PRODUCT MANAGEMENT</span>
          <h2>Edit Product</h2>
          <p>Update your product details, price and available stock.</p>
        </div>

        <div className="fap-divider" />

        <form onSubmit={handleSubmit} className="fap-form">
          <div className="fap-section-title">
            <span className="fap-section-icon">
              <Leaf size={17} />
            </span>
            <div>
              <h3>Product Information</h3>
              <p>Make changes to the selected product.</p>
            </div>
          </div>

          <div className="fap-field">
            <label htmlFor="edit-name">
              Product Name <span>*</span>
            </label>
            <input
              id="edit-name"
              name="name"
              type="text"
              maxLength={100}
              value={form.name}
              onChange={handleChange}
              placeholder="Enter product name"
              required
            />
          </div>

          <div className="fap-grid">
            <div className="fap-field">
              <label htmlFor="edit-category">
                Category <span>*</span>
              </label>
              <select
                id="edit-category"
                name="category"
                value={form.category}
                onChange={handleChange}
                required
              >
                <option value="Vegetables">Vegetables</option>
                <option value="Fruits">Fruits</option>
                <option value="Dairy">Dairy</option>
                <option value="Grains">Grains</option>
                <option value="Herbs">Herbs</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="fap-field">
              <label htmlFor="edit-price">
                Price (₹) <span>*</span>
              </label>
              <div className="fap-input-icon">
                <IndianRupee size={17} />
                <input
                  id="edit-price"
                  name="price"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.price}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="fap-field">
            <label htmlFor="edit-quantity">
              Available Stock <span>*</span>
            </label>
            <div className="fap-input-icon">
              <Boxes size={18} />
              <input
                id="edit-quantity"
                name="quantity"
                type="number"
                min="0"
                step="1"
                value={form.quantity}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="fap-field">
            <label htmlFor="edit-description">
              Product Description
            </label>
            <div className="fap-textarea-icon">
              <FileText size={17} />
              <textarea
                id="edit-description"
                name="description"
                rows={4}
                maxLength={1000}
                value={form.description}
                onChange={handleChange}
                placeholder="Describe your product..."
              />
            </div>
          </div>

          {error && (
            <div className="fap-error" role="alert">
              {error}
            </div>
          )}

          <div className="fap-form-footer">
            <p><span>*</span> Required fields</p>

            <div className="fap-actions">
              <Link
                to="/farmer/products"
                className="fap-cancel-button"
              >
                Cancel
              </Link>

              <button
                type="submit"
                className="fap-save-button"
                disabled={saving}
              >
                <Save size={17} />
                {saving ? "Updating..." : "Save Changes"}
              </button>
            </div>
          </div>
        </form>
      </section>
    </div>
  );
}

export default FarmerEditProduct;

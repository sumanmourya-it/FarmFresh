
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  PackagePlus,
  Save,
  Leaf,
  IndianRupee,
  Boxes,
  FileText,
} from "lucide-react";
import "./App.css";

const API_URL = "http://localhost:8081/api/products";

function FarmerAddProduct() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    category: "Vegetables",
    price: "",
    quantity: "",
    description: "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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
      const response = await fetch("http://localhost:8081/api/products", {
        method: "POST",
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
        throw new Error("Could not save the product.");
      }

      navigate("/farmer/products");
    } catch {
      setError(
        "Unable to save the product. Check that the backend and database are running."
      );
    } finally {
      setSaving(false);
    }
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
          <h2>Add New Product</h2>
          <p>
            Add your fresh produce to the FarmFresh catalogue.
          </p>
        </div>

        <div className="fap-divider" />

        <form onSubmit={handleSubmit} className="fap-form">
          <div className="fap-section-title">
            <span className="fap-section-icon">
              <Leaf size={17} />
            </span>
            <div>
              <h3>Product Information</h3>
              <p>Enter the basic details of your product.</p>
            </div>
          </div>

          <div className="fap-field">
            <label htmlFor="product-name">
              Product Name <span>*</span>
            </label>
            <input
              id="product-name"
              name="name"
              type="text"
              maxLength={100}
              placeholder="e.g. Fresh Farm Tomatoes"
              value={form.name}
              onChange={handleChange}
              required
            />
            <small>Use a clear name customers will recognise.</small>
          </div>

          <div className="fap-grid">
            <div className="fap-field">
              <label htmlFor="product-category">
                Category <span>*</span>
              </label>
              <select
                id="product-category"
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
              <label htmlFor="product-price">
                Price (₹) <span>*</span>
              </label>
              <div className="fap-input-icon">
                <IndianRupee size={17} />
                <input
                  id="product-price"
                  name="price"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="e.g. 40.00"
                  value={form.price}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="fap-field">
            <label htmlFor="product-quantity">
              Available Stock <span>*</span>
            </label>
            <div className="fap-input-icon">
              <Boxes size={18} />
              <input
                id="product-quantity"
                name="quantity"
                type="number"
                min="0"
                step="1"
                placeholder="Enter available quantity"
                value={form.quantity}
                onChange={handleChange}
                required
              />
            </div>
            <small>
              Enter the number of units currently available.
            </small>
          </div>

          <div className="fap-field">
            <label htmlFor="product-description">
              Product Description
            </label>
            <div className="fap-textarea-icon">
              <FileText size={17} />
              <textarea
                id="product-description"
                name="description"
                rows={4}
                maxLength={1000}
                placeholder="Describe freshness, quality, origin, or how the product is grown..."
                value={form.description}
                onChange={handleChange}
              />
            </div>
            <small>Optional · Maximum 1,000 characters.</small>
          </div>

          {error && (
            <div className="fap-error" role="alert">
              {error}
            </div>
          )}

          <div className="fap-form-footer">
            <p>
              <span>*</span> Required fields
            </p>

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
                {saving ? "Saving Product..." : "Save Product"}
              </button>
            </div>
          </div>
        </form>
      </section>

      <div className="fap-note">
        <Leaf size={17} />
        <span>
          Keep your product details accurate to help customers shop with confidence.
        </span>
      </div>
    </div>
  );
}

export default FarmerAddProduct;

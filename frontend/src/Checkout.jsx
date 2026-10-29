
import { useState } from "react";

function Checkout() {
  const [customer, setCustomer] = useState({
    name: "",
    email: "",
    mobile: "",
    address: "",
    city: "",
    pincode: "",
    payment: "Cash on Delivery",
  });

  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedOrder, setSavedOrder] = useState(null);

  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem("farmfreshCart");
      return savedCart ? JSON.parse(savedCart) : [];
    } catch {
      return [];
    }
  });

  const cartTotal = cartItems.reduce(
    (total, item) =>
      total + Number(item.price) * Number(item.quantity),
    0
  );

  const cartCount = cartItems.reduce(
    (total, item) => total + Number(item.quantity),
    0
  );

  const handleChange = (event) => {
    const { name, value } = event.target;

    setCustomer((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (saving) return;

    if (cartItems.length === 0) {
      alert("Your cart is empty. Please add products first.");
      return;
    }

    let auth;

    try {
      auth = JSON.parse(
        sessionStorage.getItem("farmfreshAuth") || "null"
      );
    } catch {
      alert("Your login session is invalid. Please log in again.");
      window.location.href = "/login";
      return;
    }

    if (!auth?.token) {
      alert("Please log in as a customer before placing your order.");
      window.location.href = "/login";
      return;
    }

    if (auth.role && auth.role !== "CUSTOMER") {
      alert("Please log in with a customer account to place an order.");
      return;
    }

    const orderData = {
      name: customer.name.trim(),
      email: auth.email || customer.email.trim(),
      mobile: customer.mobile.trim(),
      address: customer.address.trim(),
      city: customer.city.trim(),
      pincode: customer.pincode.trim(),
      payment: customer.payment,
      total: cartTotal,
      items: cartItems.map((item) => ({
        productId: item.id,
        name: item.name,
        price: Number(item.price),
        quantity: Number(item.quantity),
        subtotal: Number(item.price) * Number(item.quantity),
      })),
    };

    setSaving(true);

    try {
      const response = await fetch("http://localhost:8081/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorDetails = await response.text();

        throw new Error(
          `Order failed (${response.status}): ${
            errorDetails || "The server could not save the order."
          }`
        );
      }

      const result = await response.json();

      setSavedOrder(result);
      setSubmitted(true);
      localStorage.removeItem("farmfreshCart");
      setCartItems([]);
    } catch (error) {
      console.error("Order Error:", error);

      alert(
        `Order could not be saved.\n${error.message}\n\n` +
        "Check that Spring Boot is running and review the browser Console."
      );
    } finally {
      setSaving(false);
    }
  };

  if (submitted) {
    return (
      <div className="checkout-page">
        <header className="checkout-header">
          <div className="checkout-logo">🌿 FarmFresh</div>
          <span>🔒 Secure Checkout</span>
        </header>

        <div className="success-card">
          <div className="success-icon">✓</div>

          <h1>Order Confirmed!</h1>

          <p>
            Thank you, <strong>{customer.name}</strong>!
          </p>

          <p className="success-text">
            Your FarmFresh order has been placed successfully.
          </p>

          <div className="order-info">
            {savedOrder?.id != null && (
              <p>
                <strong>Order Number:</strong> {savedOrder.id}
              </p>
            )}

            <p>
              <strong>Order Status:</strong>{" "}
              {savedOrder?.status || "Pending"}
            </p>

            <p>
              <strong>Delivery City:</strong> {customer.city}
            </p>

            <p>
              <strong>Payment:</strong> {customer.payment}
            </p>

            <p>
              <strong>Order Total:</strong> ₹{cartTotal}
            </p>
          </div>

          <button
            type="button"
            className="checkout-button"
            onClick={() => {
              window.location.href = "/customer/orders";
            }}
          >
            Track My Order
          </button>

          <button
            type="button"
            className="back-button"
            onClick={() => {
              window.location.href = "/shop";
            }}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <header className="checkout-header">
        <div className="checkout-logo">🌿 FarmFresh</div>
        <span>🔒 Secure Checkout</span>
      </header>

      <div className="checkout-container">
        <div className="checkout-main">
          <div className="checkout-title">
            <span className="step-label">CHECKOUT</span>
            <h1>Complete Your Order</h1>
            <p>Fresh products, delivered directly to your doorstep.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <section className="checkout-card">
              <h2>
                <span>1</span> Contact Information
              </h2>

              <div className="form-grid">
                <div className="form-group full-width">
                  <label htmlFor="name">Full Name</label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    placeholder="Enter your full name"
                    value={customer.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    value={customer.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="mobile">Mobile Number</label>
                  <input
                    id="mobile"
                    type="tel"
                    name="mobile"
                    placeholder="10-digit mobile number"
                    pattern="[0-9]{10}"
                    maxLength={10}
                    value={customer.mobile}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </section>

            <section className="checkout-card">
              <h2>
                <span>2</span> Delivery Address
              </h2>

              <div className="form-group">
                <label htmlFor="address">Complete Address</label>
                <textarea
                  id="address"
                  name="address"
                  placeholder="House number, street, area"
                  rows={3}
                  value={customer.address}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="city">City</label>
                  <input
                    id="city"
                    type="text"
                    name="city"
                    placeholder="Enter city"
                    value={customer.city}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="pincode">PIN Code</label>
                  <input
                    id="pincode"
                    type="text"
                    name="pincode"
                    placeholder="6-digit PIN code"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    value={customer.pincode}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </section>

            <section className="checkout-card">
              <h2>
                <span>3</span> Payment Method
              </h2>

              <label className="payment-option">
                <input
                  type="radio"
                  name="payment"
                  value="Cash on Delivery"
                  checked={customer.payment === "Cash on Delivery"}
                  onChange={handleChange}
                />

                <div>
                  <strong>💵 Cash on Delivery</strong>
                  <p>Pay when your order arrives.</p>
                </div>
              </label>

              <label className="payment-option">
                <input
                  type="radio"
                  name="payment"
                  value="UPI"
                  checked={customer.payment === "UPI"}
                  onChange={handleChange}
                />

                <div>
                  <strong>📱 UPI Payment</strong>
                  <p>Demo option for project presentation.</p>
                </div>
              </label>
            </section>

            <button
              type="submit"
              className="checkout-button"
              disabled={cartItems.length === 0 || saving}
            >
              {saving
                ? "Placing Order..."
                : `Place Order ₹${cartTotal} →`}
            </button>

            {cartItems.length === 0 && (
              <p>Your cart is empty. Add products before checkout.</p>
            )}

            <button
              type="button"
              className="back-button"
              onClick={() => {
                window.location.href = "/shop";
              }}
            >
              ← Back to Shopping
            </button>
          </form>
        </div>

        <aside className="checkout-summary">
          <h2>Order Summary</h2>

          <div className="summary-item">
            <span>Total Items</span>
            <strong>{cartCount}</strong>
          </div>

          <div className="summary-products">
            {cartItems.length === 0 ? (
              <p>Your cart is empty.</p>
            ) : (
              cartItems.map((item) => (
                <div className="summary-product" key={item.id}>
                  <div>
                    <strong>{item.name}</strong>
                    <p>
                      ₹{item.price} × {item.quantity}
                    </p>
                  </div>

                  <strong>
                    ₹{Number(item.price) * Number(item.quantity)}
                  </strong>
                </div>
              ))
            )}
          </div>

          <div className="summary-item">
            <span>Delivery</span>
            <strong className="free">FREE</strong>
          </div>

          <div className="summary-divider" />

          <div className="summary-total">
            <span>Total</span>
            <strong>₹{cartTotal}</strong>
          </div>

          <div className="secure-message">
            🔒 Your information is collected for this demo checkout.
          </div>
        </aside>
      </div>
    </div>
  );
}

export default Checkout;

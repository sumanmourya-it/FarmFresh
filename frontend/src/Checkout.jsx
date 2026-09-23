
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

  const [cartItems] = useState(() => {
    const savedCart = localStorage.getItem("farmfreshCart");

    return savedCart ? JSON.parse(savedCart) : [];
  });

  const cartTotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const cartCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const handleChange = (event) => {
    const { name, value } = event.target;

    setCustomer((previousCustomer) => ({
      ...previousCustomer,
      [name]: value,
    }));
  };

 const handleSubmit = async (event) => {
  event.preventDefault();

  const orderData = {
    name: customer.name,
    email: customer.email,
    mobile: customer.mobile,
    address: customer.address,
    city: customer.city,
    pincode: customer.pincode,
    payment: customer.payment,
    total: cartTotal,
  };

  try {
    const response = await fetch("http://localhost:8081/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      throw new Error("Order could not be saved");
    }

    setSubmitted(true);
    localStorage.removeItem("farmfreshCart");
  } catch (error) {
    console.error("Order Error:", error);

    alert(
      "Order could not be saved. Please make sure the Spring Boot backend is running."
    );
  }
};
  if (submitted) {
    return (
      <div className="checkout-page">
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
            <p>
              <strong>Order Status:</strong> Confirmed
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
            className="checkout-button"
            onClick={() => {
              window.location.href = "/";
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
      {/* HEADER */}
      <header className="checkout-header">
        <div className="checkout-logo">🌿 FarmFresh</div>

        <span>🔒 Secure Checkout</span>
      </header>

      {/* CHECKOUT CONTAINER */}
      <div className="checkout-container">
        {/* MAIN FORM */}
        <div className="checkout-main">
          <div className="checkout-title">
            <span className="step-label">CHECKOUT</span>

            <h1>Complete Your Order</h1>

            <p>
              Fresh products, delivered directly to your doorstep.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* CONTACT INFORMATION */}
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
                    maxLength="10"
                    value={customer.mobile}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </section>

            {/* DELIVERY ADDRESS */}
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
                  rows="3"
                  value={customer.address}
                  onChange={handleChange}
                  required
                ></textarea>
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
                    maxLength="6"
                    value={customer.pincode}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </section>

            {/* PAYMENT METHOD */}
            <section className="checkout-card">
              <h2>
                <span>3</span> Payment Method
              </h2>

              <label className="payment-option">
                <input
                  type="radio"
                  name="payment"
                  value="Cash on Delivery"
                  checked={
                    customer.payment === "Cash on Delivery"
                  }
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

            {/* PLACE ORDER */}
            <button
              type="submit"
              className="checkout-button"
              disabled={cartItems.length === 0}
            >
              Place Order ₹{cartTotal} →
            </button>

            {/* BACK TO SHOPPING */}
            <button
              type="button"
              className="back-button"

              onClick={() => {
  localStorage.setItem(
    "farmfreshCart",
    JSON.stringify(cartItems)
  );

  window.location.href = "/checkout";
}}
            >
              ← Back to Shopping
            </button>
          </form>
        </div>

        {/* ORDER SUMMARY */}
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
                    ₹{item.price * item.quantity}
                  </strong>
                </div>
              ))
            )}
          </div>

          <div className="summary-item">
            <span>Delivery</span>
            <strong className="free">FREE</strong>
          </div>

          <div className="summary-divider"></div>

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
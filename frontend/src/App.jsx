
import "./App.css";

function App() {
  return (
    <div className="app">

      {/* Navbar */}
      <nav className="navbar">
        <h2>🌱 FarmFresh</h2>

        <div className="nav-links">
          <a href="#">Home</a>
          <a href="#">Products</a>
          <a href="#">About</a>
          <a href="#">Contact</a>
          <button>Login</button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div>
          <h1>Fresh From Farm to Your Door</h1>

          <p>
            Buy fresh fruits, vegetables and farm products
            directly from trusted farmers.
          </p>

          <button className="shop-btn">
            Shop Now
          </button>
        </div>

        <div className="hero-emoji">
          🥬 🥕 🍅
        </div>
      </section>

      {/* Categories */}
      <section className="categories">
        <h2>Shop by Category</h2>

        <div className="category-container">
          <div className="category-card">
            🍎
            <h3>Fruits</h3>
          </div>

          <div className="category-card">
            🥦
            <h3>Vegetables</h3>
          </div>

          <div className="category-card">
            🌾
            <h3>Grains</h3>
          </div>

          <div className="category-card">
            🥛
            <h3>Dairy</h3>
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="products">
        <h2>Popular Products</h2>

        <div className="product-container">
          <div className="product-card">
            <div className="product-image">🍅</div>
            <h3>Fresh Tomatoes</h3>
            <p>₹40 / kg</p>
            <button>Add to Cart</button>
          </div>

          <div className="product-card">
            <div className="product-image">🥔</div>
            <h3>Fresh Potatoes</h3>
            <p>₹35 / kg</p>
            <button>Add to Cart</button>
          </div>

          <div className="product-card">
            <div className="product-image">🥕</div>
            <h3>Fresh Carrots</h3>
            <p>₹50 / kg</p>
            <button>Add to Cart</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <p>© 2026 FarmFresh | Freshness You Can Trust 🌱</p>
      </footer>

    </div>
  );
}

export default App;
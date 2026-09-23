
import { useState, useEffect } from "react";
import Checkout from "./Checkout";
import AdminOrders from "./AdminOrders";
import "./App.css";

const fallbackProducts = [
  {
    id: 1,
    name: "Fresh Tomatoes",
    price: 40,
    image:
      "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=600",
    category: "Vegetables",
  },
  {
    id: 2,
    name: "Fresh Potatoes",
    price: 35,
    image:
      "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600",
    category: "Vegetables",
  },
  {
    id: 3,
    name: "Fresh Carrots",
    price: 50,
    image:
      "https://images.unsplash.com/photo-1445282768818-728615cc910a?w=600",
    category: "Vegetables",
  },
  {
    id: 4,
    name: "Fresh Apples",
    price: 120,
    image:
      "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600",
    category: "Fruits",
  },
  {
    id: 5,
    name: "Fresh Bananas",
    price: 60,
    image:
      "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600",
    category: "Fruits",
  },
  {
    id: 6,
    name: "Fresh Milk",
    price: 60,
    image:
      "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600",
    category: "Dairy",
  },
  {
    id: 7,
    name: "Whole Wheat",
    price: 80,
    image:
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600",
    category: "Grains",
  },
];

function App() {
  if (window.location.pathname === "/checkout") {
    return <Checkout />;
  }

  if (window.location.pathname === "/admin") {
  return <AdminOrders />;
}

  const [cartItems, setCartItems] = useState([]);
  const [products, setProducts] = useState(fallbackProducts);
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    fetch("http://localhost:8081/api/products")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        return response.json();
      })
      .then((data) => {
        const imageMap = {
          "Fresh Tomatoes":
            "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=600",
          "Fresh Potatoes":
            "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600",
          "Fresh Carrots":
            "https://images.unsplash.com/photo-1445282768818-728615cc910a?w=600",
          "Fresh Apples":
            "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600",
          "Fresh Bananas":
            "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600",
          "Fresh Milk":
            "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600",
          "Whole Wheat":
            "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600",
        };

        const productsWithImages = data.map((product) => ({
          ...product,
          image:
            imageMap[product.name] ||
            "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600",
        }));

        setProducts(productsWithImages);
      })
      .catch((error) => {
        console.error("API Error:", error);
      });
  }, []);

  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter(
          (product) => product.category === selectedCategory
        );

  const cartCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const cartTotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const goHome = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const selectCategory = (category) => {
    setSelectedCategory(category);

    setTimeout(() => {
      document.getElementById("products")?.scrollIntoView({
        behavior: "smooth",
      });
    }, 100);
  };

  const showAllProducts = () => {
    setSelectedCategory("All");

    setTimeout(() => {
      document.getElementById("products")?.scrollIntoView({
        behavior: "smooth",
      });
    }, 100);
  };

  const addToCart = (product) => {
    setCartItems((previousItems) => {
      const existingItem = previousItems.find(
        (item) => item.id === product.id
      );

      if (existingItem) {
        return previousItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...previousItems, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCartItems((previousItems) =>
      previousItems
        .map((item) =>
          item.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  return (
    <div className="app" id="home">
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="logo">
          <span>🌿</span> FarmFresh
        </div>

        <div className="nav-links">
          <button className="nav-button" onClick={goHome}>
            Home
          </button>

          <button className="nav-button" onClick={showAllProducts}>
            Products
          </button>

          <a href="#categories">Categories</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>

          <a href="#cart" className="cart">
            🛒 Cart ({cartCount})
          </a>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="hero">
        <div className="hero-content">
          <span className="hero-label">FRESH FROM THE FARM</span>

          <h1>
            Good Food.
            <br />
            <span>Good Life.</span>
          </h1>

          <p>
            Discover fresh, healthy, and quality farm products
            delivered directly to your doorstep.
          </p>

          <div className="hero-buttons">
            <button className="primary-btn" onClick={showAllProducts}>
              Explore Products →
            </button>

            <a href="#about" className="secondary-btn">
              Learn More
            </a>
          </div>

          <div className="hero-trust">
            <div>
              <strong>100%</strong>
              <span>Fresh Products</span>
            </div>

            <div>
              <strong>24/7</strong>
              <span>Quality Care</span>
            </div>

            <div>
              <strong>100+</strong>
              <span>Happy Customers</span>
            </div>
          </div>
        </div>

        <div className="hero-image">
          <img
            src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=900"
            alt="Fresh vegetables"
          />
        </div>
      </section>

      {/* CATEGORIES SECTION */}
      <section className="categories" id="categories">
        <div className="section-heading">
          <span>EXPLORE OUR COLLECTION</span>

          <h2>Fresh Choices for a Healthier You</h2>

          <p>
            Explore our farm-fresh categories and bring home
            the best of nature.
          </p>
        </div>

        <div className="category-container">
          {[
            {
              name: "Fruits",
              description: "Fresh & Natural",
              image:
                "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=600",
            },
            {
              name: "Vegetables",
              description: "Farm Fresh",
              image:
                "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600",
            },
            {
              name: "Grains",
              description: "Healthy Choices",
              image:
                "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600",
            },
            {
              name: "Dairy",
              description: "Pure & Nutritious",
              image:
                "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600",
            },
          ].map((category) => (
            <div
              className="category-card"
              key={category.name}
              onClick={() => selectCategory(category.name)}
            >
              <div className="category-image">
                <img src={category.image} alt={category.name} />
              </div>

              <div className="category-info">
                <div>
                  <h3>{category.name}</h3>
                  <p>{category.description}</p>
                </div>

                <span className="category-arrow">→</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PRODUCTS SECTION */}
      <section className="products-section" id="products">
        <div className="section-heading">
          <span>OUR BESTSELLERS</span>

          <h2>
            {selectedCategory === "All"
              ? "Popular Products"
              : `${selectedCategory} Products`}
          </h2>

          <p>
            Carefully selected products for your everyday needs.
          </p>
        </div>

        <div className="category-filters">
          {["All", "Fruits", "Vegetables", "Grains", "Dairy"].map(
            (category) => (
              <button
                key={category}
                className={
                  selectedCategory === category ? "active" : ""
                }
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            )
          )}
        </div>

        <div className="product-container">
          {filteredProducts.map((product) => (
            <div className="product-card" key={product.id}>
              <div className="product-image">
                <span className="fresh-badge">FRESH</span>

                <img src={product.image} alt={product.name} />
              </div>

              <div className="product-info">
                <p className="product-category">
                  {product.category}
                </p>

                <h3>{product.name}</h3>

                <div className="rating">★★★★★</div>

                <div className="product-bottom">
                  <strong>₹{product.price} / kg</strong>

                  <button onClick={() => addToCart(product)}>
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CART SECTION */}
      <section className="products-section" id="cart">
        <div className="section-heading">
          <span>YOUR SHOPPING CART</span>
          <h2>Cart Summary</h2>
        </div>

        {cartItems.length === 0 ? (
          <p style={{ textAlign: "center" }}>
            Your cart is empty. Add some fresh products!
          </p>
        ) : (
          <div style={{ maxWidth: "700px", margin: "auto" }}>
            {cartItems.map((item) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "15px",
                  marginBottom: "10px",
                  background: "white",
                  borderRadius: "10px",
                }}
              >
                <div>
                  <strong>{item.name}</strong>
                  <p>
                    ₹{item.price} × {item.quantity}
                  </p>
                </div>

                <div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    style={{ marginRight: "10px" }}
                  >
                    −
                  </button>

                  <button onClick={() => addToCart(item)}>
                    +
                  </button>
                </div>
              </div>
            ))}

            <h2
              style={{
                textAlign: "center",
                color: "#2f793d",
                fontSize: "26px",
                fontWeight: "700",
                margin: "20px 0",
              }}
            >
              Total: ₹{cartTotal}
            </h2>

            <button
  className="primary-btn"
  onClick={() => {
    localStorage.setItem(
      "farmfreshCart",
      JSON.stringify(cartItems)
    );

    window.location.href = "/checkout";
  }}
>
  Proceed to Checkout →
</button>

          </div>
        )}
      </section>

      {/* ABOUT SECTION */}
      <section className="about-section" id="about">
        <div className="about-image">
          <img
            src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800"
            alt="Green farmland"
          />
        </div>

        <div className="about-content">
          <span>WHY CHOOSE FARMFRESH</span>

          <h2>From Our Farm to Your Family</h2>

          <p>
            FarmFresh helps customers discover fresh and quality
            agricultural products while supporting local farmers.
          </p>

          <p>
            We focus on freshness, reliability, and a simple
            shopping experience for everyone.
          </p>

          <a href="#contact" className="primary-btn">
            Contact Us →
          </a>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section className="contact-section" id="contact">
        <div className="section-heading">
          <span>GET IN TOUCH</span>

          <h2>We Would Love to Hear From You</h2>

          <p>Have a question? Contact the FarmFresh team.</p>
        </div>

        <div className="contact-container">
          <div className="contact-card">
            <span>✉</span>
            <h3>Email Us</h3>
            <p>farmfresh@gmail.com</p>
          </div>

          <div className="contact-card">
            <span>☎</span>
            <h3>Call Us</h3>
            <p>+91 9876543210</p>
          </div>

          <div className="contact-card">
            <span>⌖</span>
            <h3>Our Location</h3>
            <p>Thane, Maharashtra</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-logo">🌿 FarmFresh</div>

        <p>Freshness you can trust.</p>

        <small>© 2026 FarmFresh. All rights reserved.</small>
      </footer>
    </div>
  );
}

export default App;
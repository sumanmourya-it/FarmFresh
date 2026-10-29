
import { useSearchParams } from "react-router-dom";
import { useState } from "react";
import "./Login.css";

const API_URL = "http://localhost:8081/api/auth";

const VALID_LOGIN_ROLES = ["CUSTOMER", "FARMER"];

function Login({ onLogin, adminOnly = false }) {
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Automatically determine the login role.
  // No account-type dropdown is displayed.
  const urlRole = (searchParams.get("role") || "")
    .trim()
    .toUpperCase();

  const savedRole = (
    sessionStorage.getItem("farmfreshSelectedRole") || ""
  )
    .trim()
    .toUpperCase();

  const selectedRole = adminOnly
    ? "ADMIN"
    : VALID_LOGIN_ROLES.includes(urlRole)
      ? urlRole
      : VALID_LOGIN_ROLES.includes(savedRole)
        ? savedRole
        : "CUSTOMER";

  async function sendRequest(endpoint, body) {
    const response = await fetch(`${API_URL}/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const responseText = await response.text();
    let data = {};

    if (responseText) {
      try {
        data = JSON.parse(responseText);
      } catch {
        data = { message: responseText };
      }
    }

    if (!response.ok) {
      throw new Error(
        data.message ||
          data.error ||
          `Request failed (${response.status}).`
      );
    }

    return data;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    const cleanEmail = email.trim().toLowerCase();

    if (
      adminOnly
        ? selectedRole !== "ADMIN"
        : !VALID_LOGIN_ROLES.includes(selectedRole)
    ) {
      setError(
        "Invalid login configuration. Please reopen the login page."
      );
      return;
    }

    if (!cleanEmail || !password) {
      setError("Please enter your email address and password.");
      return;
    }

    if (typeof onLogin !== "function") {
      setError(
        "The login handler is not connected in App.jsx."
      );
      return;
    }

    setLoading(true);

    try {
      const loginData = await sendRequest("login", {
        email: cleanEmail,
        password,
        role: selectedRole,
      });

      if (
        !loginData.token ||
        !loginData.email ||
        !loginData.role
      ) {
        throw new Error(
          "The backend response is missing the token, email, or role."
        );
      }

      const returnedRole = String(loginData.role)
        .trim()
        .toUpperCase();

      if (returnedRole !== selectedRole) {
        throw new Error(
          "The account role does not match this login page."
        );
      }

      // App.jsx handles authentication and dashboard navigation.
      onLogin(loginData);
    } catch (err) {
      if (err instanceof TypeError) {
        setError(
          "Cannot connect to the backend. Check that Spring Boot is running on port 8081."
        );
      } else {
        setError(
          err.message || "Something went wrong. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        {/* FarmFresh Brand */}
        <a href="/" className="auth-brand">
          <span
            className="auth-brand-icon"
            aria-hidden="true"
          >
            <svg
              className="farmfresh-logo"
              viewBox="0 0 64 64"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
            >
              <defs>
                <linearGradient
                  id="farmfresh-leaf-dark"
                  x1="15"
                  y1="10"
                  x2="44"
                  y2="44"
                >
                  <stop offset="0%" stopColor="#8DCB67" />
                  <stop offset="100%" stopColor="#267346" />
                </linearGradient>

                <linearGradient
                  id="farmfresh-leaf-light"
                  x1="37"
                  y1="7"
                  x2="53"
                  y2="38"
                >
                  <stop offset="0%" stopColor="#B8DC82" />
                  <stop offset="100%" stopColor="#438B4F" />
                </linearGradient>

                <linearGradient
                  id="farmfresh-stem"
                  x1="30"
                  y1="25"
                  x2="34"
                  y2="53"
                >
                  <stop offset="0%" stopColor="#438B4F" />
                  <stop offset="100%" stopColor="#205D38" />
                </linearGradient>
              </defs>

              <path
                d="M32 51C32 40 31 30 33 20"
                stroke="url(#farmfresh-stem)"
                strokeWidth="3"
                strokeLinecap="round"
              />

              <path
                d="M31 35C17 36 9 28 10 13C25 12 35 20 31 35Z"
                fill="url(#farmfresh-leaf-dark)"
              />

              <path
                d="M14 17C20 23 25 28 31 34"
                stroke="#E5F4D8"
                strokeWidth="1.5"
                strokeLinecap="round"
              />

              <path
                d="M33 26C33 13 42 6 55 9C56 22 48 31 33 32Z"
                fill="url(#farmfresh-leaf-light)"
              />

              <path
                d="M51 12C45 18 39 24 33 30"
                stroke="#EDF7DF"
                strokeWidth="1.5"
                strokeLinecap="round"
              />

              <path
                d="M32 44C21 45 17 40 18 33C28 33 33 37 32 44Z"
                fill="#6AA75B"
              />

              <path
                d="M22 53H42"
                stroke="#276749"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </span>

          <span className="auth-brand-name">
            FarmFresh
          </span>
        </a>

        {/* Login Heading */}
        <div className="auth-heading">
          <span className="auth-eyebrow">
            {adminOnly
              ? "FARMFRESH ADMINISTRATION"
              : "FRESH FROM THE FARM"}
          </span>

          <h1>
            {adminOnly ? "Admin Sign In." : "Welcome back."}
          </h1>

          <p>
            {adminOnly
              ? "Sign in to manage the FarmFresh platform."
              : "Sign in to discover fresh, farm-picked goodness."}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <p className="auth-error" role="alert">
            {error}
          </p>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div className="auth-field">
            <label htmlFor="login-email">
              Email address
            </label>

            <input
              id="login-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </div>

          {/* Password */}
          <div className="auth-field">
            <label htmlFor="login-password">
              Password
            </label>

            <div className="auth-password-wrap">
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                autoComplete="current-password"
                required
              />

              <button
                className="auth-password-toggle"
                type="button"
                onClick={() =>
                  setShowPassword((visible) => !visible)
                }
                aria-label={
                  showPassword ? "Hide password" : "Show password"
                }
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Sign In Button */}
          <button
            className="auth-submit"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Signing you in..."
              : adminOnly
                ? "Sign in to Admin"
                : "Sign in to FarmFresh"}

            {!loading && (
              <span aria-hidden="true"> →</span>
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="auth-footer">
          Fresh food. Trusted farmers. Delivered with care.
        </p>
      </section>
    </main>
  );
}

export default Login;

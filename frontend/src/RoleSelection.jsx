
import { useNavigate } from "react-router-dom";
import "./RoleSelection.css";

function RoleSelection() {
  const navigate = useNavigate();

  const handleRoleSelection = (role) => {
    sessionStorage.setItem("farmfreshSelectedRole", role);

    if (role === "ADMIN") {
      navigate("/admin/login");
    } else {
      navigate(`/login?role=${role}`);
    }
  };

  return (
    <main className="role-selection-page">
      <section className="role-selection-card">
        {/* FarmFresh Branding */}
        <div className="role-selection-brand">
          <span className="role-selection-icon">🌿</span>
          <h1>FarmFresh</h1>
        </div>

        <p className="role-selection-eyebrow">
          FRESH FROM THE FARM
        </p>

        <h2>Welcome to FarmFresh</h2>

        <p className="role-selection-description">
          Fresh food, trusted farmers, and a healthier way
          to shop. Choose how you would like to continue.
        </p>

        <div className="role-selection-options">
          {/* Customer */}
          <button
            type="button"
            className="role-selection-option customer-option"
            onClick={() => handleRoleSelection("CUSTOMER")}
          >
            <span className="role-selection-option-icon">
              🛒
            </span>

            <span className="role-selection-option-text">
              <strong>Continue as Customer</strong>
              <small>
                Explore fresh products and shop online.
              </small>
            </span>

            <span
              className="role-selection-arrow"
              aria-hidden="true"
            >
              →
            </span>
          </button>

          {/* Farmer */}
          <button
            type="button"
            className="role-selection-option farmer-option"
            onClick={() => handleRoleSelection("FARMER")}
          >
            <span className="role-selection-option-icon">
              🌾
            </span>

            <span className="role-selection-option-text">
              <strong>Continue as Farmer</strong>
              <small>
                Manage your farm products and orders.
              </small>
            </span>

            <span
              className="role-selection-arrow"
              aria-hidden="true"
            >
              →
            </span>
          </button>

          {/* Admin */}
          <button
            type="button"
            className="role-selection-option admin-option"
            onClick={() => handleRoleSelection("ADMIN")}
          >
            <span className="role-selection-option-icon admin-icon">
              🛡️
            </span>

            <span className="role-selection-option-text">
              <strong>Continue as Admin</strong>
              <small>
                Manage users, farmers, orders, and the platform.
              </small>
            </span>

            <span
              className="role-selection-arrow"
              aria-hidden="true"
            >
              →
            </span>
          </button>
        </div>

        <p className="role-selection-footer">
          Fresh food. Trusted farmers. Delivered with care.
        </p>
      </section>
    </main>
  );
}

export default RoleSelection;

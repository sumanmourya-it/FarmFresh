import { useEffect, useState } from "react";
import {
  UserRound,
  Mail,
  ShieldCheck,
  Pencil,
  Save,
  X,
} from "lucide-react";
import "./FarmerProfile.css";

const API_URL = "http://localhost:8081/api/farmer/profile";

function FarmerProfile() {
  const [farmer, setFarmer] = useState({
    fullName: "",
    email: "",
    role: "FARMER",
  });

  const [form, setForm] = useState({
    fullName: "",
    email: "",
  });

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    setLoading(true);
    setMessage("");

    try {
      const auth = JSON.parse(
        sessionStorage.getItem("farmfreshAuth") || "null"
      );

      if (!auth?.token) {
        setMessage("Please log in again to view your profile.");
        setMessageType("error");
        return;
      }

      const response = await fetch(API_URL, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not load your profile.");
      }

      const profile = {
        fullName: data.fullName || "",
        email: data.email || "",
        role: data.role || "FARMER",
      };

      setFarmer(profile);
      setForm({
        fullName: profile.fullName,
        email: profile.email,
      });
    } catch (error) {
      setMessage(error.message || "Could not connect to the server.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }

  function startEditing() {
    setForm({
      fullName: farmer.fullName,
      email: farmer.email,
    });
    setMessage("");
    setEditing(true);
  }

  function cancelEditing() {
    setForm({
      fullName: farmer.fullName,
      email: farmer.email,
    });
    setEditing(false);
    setMessage("");
  }

  async function handleSave(event) {
    event.preventDefault();

    if (!form.fullName.trim() || !form.email.trim()) {
      setMessage("Please enter your name and email address.");
      setMessageType("error");
      return;
    }

    const auth = JSON.parse(
      sessionStorage.getItem("farmfreshAuth") || "null"
    );

    if (!auth?.token) {
      setMessage("Your session has expired. Please log in again.");
      setMessageType("error");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(API_URL, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({
          fullName: form.fullName.trim(),
          email: form.email.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not save your profile.");
      }

      const updatedProfile = {
        fullName: data.fullName,
        email: data.email,
        role: data.role || farmer.role,
      };

      setFarmer(updatedProfile);
      setForm({
        fullName: updatedProfile.fullName,
        email: updatedProfile.email,
      });
      setEditing(false);

      // Update the locally stored account details.
      // If email changed, the old token still contains the old email.
      sessionStorage.setItem(
        "farmfreshAuth",
        JSON.stringify({
          ...auth,
          fullName: updatedProfile.fullName,
          email: updatedProfile.email,
          role: updatedProfile.role,
        })
      );

      if (updatedProfile.email !== farmer.email) {
        setMessage(
          "Profile saved. Your email changed, so log out and log in again using your new email."
        );
      } else {
        setMessage("Profile updated successfully!");
      }

      setMessageType("success");
    } catch (error) {
      setMessage(error.message || "Could not connect to the server.");
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="farmer-profile-page">
        <p>Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="farmer-profile-page">
      <div className="profile-heading">
        <div>
          <span className="profile-eyebrow">YOUR ACCOUNT</span>
          <h2>Farmer Profile</h2>
          <p>View and manage your account details.</p>
        </div>

        <div className="profile-avatar">
          <UserRound size={34} />
        </div>
      </div>

      <section className="profile-card">
        <div className="profile-card-heading">
          <div className="profile-section-title">
            <UserRound size={21} />
            <h3>Personal Information</h3>
          </div>

          {!editing && (
            <button
              type="button"
              className="profile-edit-btn"
              onClick={startEditing}
            >
              <Pencil size={16} />
              Edit Profile
            </button>
          )}
        </div>

        <form onSubmit={handleSave}>
          <div className="profile-field">
            <label htmlFor="farmer-name">Full Name</label>
            <div className="profile-value">
              <UserRound size={18} />
              <input
                id="farmer-name"
                type="text"
                value={form.fullName}
                disabled={!editing || saving}
                onChange={(e) =>
                  setForm({ ...form, fullName: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="profile-field">
            <label htmlFor="farmer-email">Email Address</label>
            <div className="profile-value">
              <Mail size={18} />
              <input
                id="farmer-email"
                type="email"
                value={form.email}
                disabled={!editing || saving}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="profile-field">
            <label>Account Type</label>
            <div className="profile-value">
              <ShieldCheck size={18} />
              <span>{farmer.role}</span>
            </div>
          </div>

          {editing && (
            <div className="profile-actions">
              <button
                type="submit"
                className="profile-save-btn"
                disabled={saving}
              >
                <Save size={16} />
                {saving ? "Saving..." : "Save Changes"}
              </button>

              <button
                type="button"
                className="profile-cancel-btn"
                onClick={cancelEditing}
                disabled={saving}
              >
                <X size={16} />
                Cancel
              </button>
            </div>
          )}

          {message && (
            <p
              className={`profile-message ${messageType}`}
              role="status"
            >
              {message}
            </p>
          )}
        </form>

        <p className="profile-note">
          Keep your account information accurate and up to date.
        </p>
      </section>
    </div>
  );
}

export default FarmerProfile;
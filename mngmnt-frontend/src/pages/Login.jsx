import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Local form state
  const [formData, setFormData] = useState({ email: "", password: "" });

  // Error message
  const [error, setError] = useState("");

  // Loading state
  const [loading, setLoading] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      // Attempt login
      const result = await login(formData.email, formData.password);

      if (result.success) {
        navigate("/dashboard");
      } else {
        setError(result.message || "Invalid credentials");
      }
    } catch {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Disable button if fields empty
  const isFormValid = formData.email && formData.password;

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Left: Form Section */}
        <div className="auth-form-section">
          {/* Logo */}
          <div className="auth-logo">
            <img src="/hubly-logo.png" alt="Hubly" />
            <span>Hubly</span>
          </div>

          <div className="auth-form-wrapper">
            {/* Title */}
            <div className="auth-title-row">
              <h1 className="auth-title">Sign in to Plexify</h1>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="auth-form">
              {/* Email Field */}
              <div className="auth-form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              {/* Password Field */}
              <div className="auth-form-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>

              {/* Error text */}
              {error && <p className="auth-error">{error}</p>}

              {/* Submit Button */}
              <button
                type="submit"
                className="auth-submit-btn"
                disabled={!isFormValid || loading}
              >
                {loading ? "Logging in..." : "Log in"}
              </button>
            </form>

            {/* Switch link */}
            <p className="auth-switch">
              Don't have an account? <Link to="/signup">Sign up</Link>
            </p>

            {/* Google Recaptcha text */}
            <p className="auth-recaptcha">
              This site is protected by reCAPTCHA and the{" "}
              <a href="#">Google Privacy Policy</a> and{" "}
              <a href="#">Terms of Service</a> apply.
            </p>
          </div>
        </div>

        {/* Right: Hero Image */}
        <div className="auth-image-section">
          <img src="/auth-image.png" alt="Authentication visual" />
        </div>
      </div>
    </div>
  );
};

export default Login;
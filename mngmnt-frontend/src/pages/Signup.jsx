import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import api from "../services/api";
import "./Auth.css";

const Signup = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // UI state
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [signupAvailable, setSignupAvailable] = useState(true);

  // On mount: check if admin signup is allowed
  useEffect(() => {
    checkSignupAvailability();
  }, []);

  // Check if signup is available (only one admin allowed)
  const checkSignupAvailability = async () => {
    try {
      const res = await api.get("/auth/signup-available");
      setSignupAvailable(res.data.available);
      if (!res.data.available) {
        setError(
          "Admin account already exists. Please contact admin for access."
        );
      }
    } catch (err) {
      console.error("Failed to check signup availability:", err);
    }
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.password
    ) {
      setError("Please fill in all required fields");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (!agreeTerms) {
      setError("Please agree to the Terms of use and Privacy Policy");
      return;
    }

    // Call signup
    setLoading(true);
    try {
      const result = await signup({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
      });

      if (result.success) {
        navigate("/dashboard");
      } else {
        setError(result.message || "Signup failed");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Signup failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Form validity
  const isFormValid =
    formData.firstName &&
    formData.lastName &&
    formData.email &&
    formData.password &&
    formData.confirmPassword &&
    agreeTerms;

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Left: form */}
        <div className="auth-form-section">
          {/* Brand */}
          <div className="auth-logo">
            <img src="/hubly-logo.png" alt="Hubly" />
            <span>Hubly</span>
          </div>

          {/* Form wrapper */}
          <div className="auth-form-wrapper">
            <div className="auth-title-row">
              <h1 className="auth-title">Create an account</h1>
              <Link to="/login" className="auth-title-link">
                Sign in instead
              </Link>
            </div>

            {/* If signup not available show message, else show form */}
            {!signupAvailable ? (
              <div className="auth-unavailable">
                <p>
                  Admin account already exists. Please contact the administrator
                  to get access.
                </p>
                <Link to="/login" className="auth-back-link">
                  Back to Login
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="auth-form">
                {/* First name */}
                <div className="auth-form-group">
                  <label>First name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder=""
                  />
                </div>

                {/* Last name */}
                <div className="auth-form-group">
                  <label>Last name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder=""
                  />
                </div>

                {/* Email */}
                <div className="auth-form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder=""
                  />
                </div>

                {/* Password */}
                <div className="auth-form-group">
                  <label>Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder=""
                  />
                </div>

                {/* Confirm password */}
                <div className="auth-form-group">
                  <label>Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder=""
                  />
                </div>

                {/* Terms checkbox */}
                <div className="auth-checkbox-group">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                  />
                  <label htmlFor="terms">
                    By creating an account, I agree to our{" "}
                    <a href="#">Terms of use</a> and{" "}
                    <a href="#">Privacy Policy</a>
                  </label>
                </div>

                {/* Error */}
                {error && <p className="auth-error">{error}</p>}

                {/* Submit */}
                <button
                  type="submit"
                  className="auth-submit-btn"
                  disabled={!isFormValid || loading}
                >
                  {loading ? "Creating account..." : "Create an account"}
                </button>
              </form>
            )}

            {/* Legal */}
            <p className="auth-recaptcha">
              This site is protected by reCAPTCHA and the{" "}
              <a href="#">Google Privacy Policy</a> and{" "}
              <a href="#">Terms of Service</a> apply.
            </p>
          </div>
        </div>

        {/* Right: hero image */}
        <div className="auth-image-section">
          <img src="/auth-image.png" alt="" />
        </div>
      </div>
    </div>
  );
};

export default Signup;
import React, { useState, FormEvent } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

const SetPassword: React.FC = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get("token");

  const handleSetPassword = async (e: FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (!token) {
      setMessage(" Invalid or missing token.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("⚠️ Passwords do not match.");
      return;
    }

    try {
      await axios.post("http://localhost:5134/api/Auth/set-password", {
        token,
        password,
      });
      setMessage(" Password set successfully! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      console.error(err);
      setMessage(" Error setting password.");
    }
  };

  return (
    <div className="d-flex justify-content-center my-5">
      <div
        className="card shadow border-0 rounded-4 w-100"
        style={{ maxWidth: "500px" }}
      >
        <div className="card-header bg-light border-0">
          <h5 className="mb-0 fw-semibold text-start">Set Your Password</h5>
        </div>
        <div className="card-body">
          {token ? (
            <form onSubmit={handleSetPassword}>
              <div className="mb-3">
                <label htmlFor="password" className="form-label fw-semibold">
                  New Password
                </label>
                <input
                  id="password"
                  type="password"
                  className="form-control rounded-3"
                  placeholder="Choose a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label
                  htmlFor="confirmPassword"
                  className="form-label fw-semibold"
                >
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  className="form-control rounded-3"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <button
                className="btn btn-dark w-100 rounded-3 py-2"
                type="submit"
              >
                Set Password
              </button>
            </form>
          ) : (
            <div className="alert alert-danger">
              Invalid or missing token. Please check your link.
            </div>
          )}
          {message && <div className="alert alert-info mt-3">{message}</div>}
        </div>
      </div>
    </div>
  );
};

export default SetPassword;

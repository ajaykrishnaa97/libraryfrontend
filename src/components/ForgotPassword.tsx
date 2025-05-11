import React, { useState, FormEvent, useContext } from "react";
import axios from "axios";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage("");

    try {
      await axios.post(
        "https://library-server-hxcjb5h7dhegcff8.canadacentral-01.azurewebsites.net/api/Auth/forgot-password",
        {
          email,
        }
      );
      setMessage(" If this email is registered, a reset link has been sent.");
    } catch (err) {
      console.error(err);
      setMessage(" Error. Please try again.");
    }
  };

  return (
    <div
      className="card shadow border-0 rounded-4 mx-auto"
      style={{ maxWidth: "500px", width: "100%" }}
    >
      <div className="card-header bg-light border-0">
        <h5 className="mb-0 fw-semibold">Forgot Password</h5>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label fw-semibold">
              Enter your email
            </label>
            <input
              id="email"
              type="email"
              className="form-control rounded-3"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button className="btn btn-dark w-100 rounded-3 py-2" type="submit">
            🔄 Send Reset Link
          </button>
          {message && (
            <div
              className="alert alert-info mt-3"
              dangerouslySetInnerHTML={{ __html: message }}
            />
          )}
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;

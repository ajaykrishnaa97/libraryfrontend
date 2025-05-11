import React, { useState, FormEvent, useEffect } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [token, setToken] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null); //  NEW

  const [searchParams] = useSearchParams();

  useEffect(() => {
    const tokenFromUrl = searchParams.get("token");
    if (tokenFromUrl) {
      setToken(tokenFromUrl);

      axios
        .get(
          `http://localhost:5134/api/Auth/validate-reset-token?token=${encodeURIComponent(
            tokenFromUrl
          )}`
        )
        .then(() => {
          setIsValidToken(true);
        })
        .catch(() => {
          setIsValidToken(false);
          setMessage(" This reset password link is invalid or has expired.");
        });
    } else {
      setIsValidToken(false);
      setMessage(" Invalid reset link.");
    }
  }, [searchParams]);

  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (password !== confirmPassword) {
      setMessage("⚠️ Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      await axios.post("http://localhost:5134/api/Auth/reset-password", {
        token,
        password,
      });
      setMessage(
        " Your password has been reset successfully! You can now log in."
      );
      setPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      console.error(err);
      if (axios.isAxiosError(err) && err.response?.data) {
        setMessage(` ${err.response.data}`);
      } else {
        setMessage(" Password reset failed. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="card shadow border-0 rounded-4 mx-auto"
      style={{ maxWidth: "500px", width: "100%" }}
    >
      <div className="card-header bg-light border-0">
        <h5 className="mb-0 fw-semibold">Reset Your Password</h5>
      </div>
      <div className="card-body">
        {isValidToken === null ? (
          <p>🔄 Validating reset link...</p>
        ) : isValidToken ? (
          <form onSubmit={handleResetPassword}>
            <div className="mb-3">
              <label htmlFor="password" className="form-label fw-semibold">
                New Password
              </label>
              <input
                id="password"
                type="password"
                className="form-control rounded-3"
                placeholder="Enter your new password"
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
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                className="form-control rounded-3"
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <button
              className="btn btn-dark w-100 rounded-3 py-2"
              type="submit"
              disabled={isSubmitting}
            >
              🔒 Reset Password
            </button>
          </form>
        ) : (
          <p className="text-danger fw-semibold">{message}</p>
        )}
        {message && isValidToken && (
          <div
            className="alert alert-info mt-3"
            dangerouslySetInnerHTML={{ __html: message }}
          />
        )}
      </div>
    </div>
  );
};

export default ResetPassword;

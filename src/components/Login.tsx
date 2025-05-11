import React, { useState, FormEvent, useContext } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom"; //  Added Link
import { AuthContext } from "./AuthContext";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post(
        "https://library-server-hxcjb5h7dhegcff8.canadacentral-01.azurewebsites.net/api/Auth/login",
        {
          email,
          password,
        }
      );

      const { token, user } = response.data;
      login(token, user.role);
      alert(" Logged in!");

      if (user.role === "Member") {
        navigate("/my-reservations");
      } else if (user.role === "Librarian") {
        navigate("/approve-users");
      } else {
        navigate("/");
      }
    } catch (err: any) {
      console.error(err);
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data);
      } else {
        setError("Login failed. Please try again.");
      }
    }
  };

  return (
    <div className="d-flex justify-content-center my-5">
      <div
        className="card shadow border-0 rounded-4 w-100"
        style={{ maxWidth: "500px" }}
      >
        <div className="card-header bg-light border-0">
          <h5 className="mb-0 fw-semibold text-start">🔑 Login</h5>
        </div>
        <div className="card-body">
          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label fw-semibold">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="form-control rounded-3"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label fw-semibold">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="form-control rounded-3"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <div className="alert alert-danger py-2">{error}</div>}
            <button className="btn btn-dark w-100 rounded-3 py-2" type="submit">
              🔓 Login
            </button>
          </form>

          {/*  Forgot Password Link */}
          <div className="text-center mt-3">
            <Link to="/forgot-password" className="text-decoration-none">
              Forgot Password?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

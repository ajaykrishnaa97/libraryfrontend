
import React, { useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";
import BookList from "./components/BookList";
import Login from "./components/Login";
import ApproveUsers from "./components/ApproveUsers";
import Register from "./components/Register";
import SetPassword from "./components/SetPassword";
import MyReservations from "./components/MyReservations";
import { AuthContext } from "./components/AuthContext";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";

function App() {
  const { isLoggedIn, role, logout } = useContext(AuthContext); //  using auth context

  return (
    <Router>
      <div className="min-vh-100 d-flex flex-column">
        {/* Navbar */}
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
          <div className="container">
            <Link
              className="navbar-brand fw-bold d-flex align-items-center"
              to="/"
            >
              <img
                src="/batman-logo-2.webp"
                alt="Batman Logo"
                style={{
                  width: "30px",
                  height: "30px",
                  marginRight: "10px",
                  objectFit: "contain",
                }}
              />
              The Comic Book Store
            </Link>

            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarNav"
              aria-controls="navbarNav"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav ms-auto">
                {/*  Books link only if logged in */}
                {isLoggedIn && (
                  <li className="nav-item">
                    <Link className="nav-link" to="/">Books</Link>
                  </li>
                )}

                {/* Members: My Reservations */}
                {isLoggedIn && role === "Member" && (
                  <li className="nav-item">
                    <Link className="nav-link" to="/my-reservations">
                      My Reservations
                    </Link>
                  </li>
                )}

                {/* Librarians: Approve Users */}
                {isLoggedIn && role === "Librarian" && (
                  <li className="nav-item">
                    <Link className="nav-link" to="/approve-users">
                      Approve Users
                    </Link>
                  </li>
                )}

                {/* Not logged in: show Login + Register */}
                {!isLoggedIn && (
                  <>
                    <li className="nav-item">
                      <Link className="nav-link" to="/login">
                        Login
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/register">
                        Register
                      </Link>
                    </li>
                  </>
                )}

                {/* Logged in: Logout */}
                {isLoggedIn && (
                  <li className="nav-item">
                    <button className="btn btn-link nav-link" onClick={logout}>
                      Logout
                    </button>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </nav>

        {/* Routes */}
        <main className="container my-5 flex-grow-1">
          <Routes>
            {/*  Protect the Books page */}
            <Route
              path="/"
              element={
                isLoggedIn ? <BookList /> : <Navigate to="/login" replace />
              }
            />

            {/* Member-only: My Reservations */}
            <Route
              path="/my-reservations"
              element={
                isLoggedIn && role === "Member" ? (
                  <MyReservations />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            {/* Librarian-only: Approve Users */}
            <Route
              path="/approve-users"
              element={
                isLoggedIn && role === "Librarian" ? (
                  <ApproveUsers />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            {/* Open routes */}
            <Route path="/login" element={<Login />} />

            <Route path="/register" element={<Register />} />
            <Route path="/set-password" element={<SetPassword />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-dark text-light text-center py-3 mt-auto">
          &copy; {new Date().getFullYear()} The Comic Book Store. All rights
          reserved.
        </footer>
      </div>
    </Router>
  );
}

export default App;
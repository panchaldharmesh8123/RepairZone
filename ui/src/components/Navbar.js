"use client";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogOut } from "lucide-react"; // Importing an icon for logout

function Navbar() {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) return null; // 🔥 Prevents flicker before user loads

  const handleLogout = () => {
    console.log("Logging out...");
    localStorage.removeItem("token");
    console.log("Token removed from localStorage");
    setTimeout(() => {
      console.log("Redirecting to login page...");
    }, 1000);
    logout();
    navigate("/login");
  };

  const IMG_SRC = require("../images/logo.png"); // Replace with your logo URL
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light mb-4 shadow-sm">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">
          <img
            src={IMG_SRC}
            alt="Logo"
            width="70"
            max-height="50"
            className="d-inline-block"
          />
          Repair<span className="text-primary">Zone</span>
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
          <ul className="navbar-nav m-auto mb-2 mb-lg-0 fw-semibold text-uppercase">
            <li className="nav-item ">
              <Link className="nav-link active" aria-current="page" to="/">
                Home
              </Link>
            </li>

            {user?.role === "user" && (
              <li className="nav-item">
                <Link className="nav-link" to="/bookings">
                  Bookings
                </Link>
              </li>
            )}

            {user?.role === "worker" && (
              <li className="nav-item">
                <Link className="nav-link" to="/worker-panel">
                  Worker Panel
                </Link>
              </li>
            )}

            {user?.role === "admin" && (
              <li className="nav-item">
                <Link className="nav-link" to="/admin-dashboard">
                  Admin
                </Link>
              </li>
            )}
          </ul>

          <ul className="navbar-nav ms-auto fw-semibold">
            {user ? (
              <li className="nav-item">
                <button
                  className="btn btn-link nav-link"
                  onClick={handleLogout}
                >
                  <LogOut className="me-1" />
                  Logout
                </button>
              </li>
            ) : (
              <li className="nav-item">
                <Link className="nav-link" to="/login">
                  Login/Signup
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

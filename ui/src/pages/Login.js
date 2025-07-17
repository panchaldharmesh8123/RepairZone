"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Spinner from "../components/Spinner";
import Toast from "../components/Toast";

function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user"); // Default role for registration
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");
  const [showToast, setShowToast] = useState(false);
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const showToastMessage = (message, type) => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    let result;

    if (isLogin) {
      result = await login(email, password);
    } else {
      result = await register(name, email, password, role);
    }

    if (result.success) {
      showToastMessage(
        `${isLogin ? "Logged in" : "Registered"} successfully!`,
        "success"
      );
      setTimeout(() => navigate("/"), 1000); // Redirect to home after 1 second
    } else {
      showToastMessage(
        result.message || `Failed to ${isLogin ? "login" : "register"}.`,
        "danger"
      );
    }
    setLoading(false);
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "calc(100vh - 100px)" }}
    >
      <div
        className="card shadow-sm p-4"
        style={{ maxWidth: "400px", width: "100%" }}
      >
        <h2 className="h4 text-center mb-4">{isLogin ? "Login" : "Signup"}</h2>
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="mb-3">
              <label htmlFor="name" className="form-label">
                Name
              </label>
              <input
                type="text"
                className="form-control"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={!isLogin}
              />
            </div>
          )}
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Email address
            </label>
            <input
              type="email"
              className="form-control"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              className="form-control"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {!isLogin && (
            <div className="mb-3">
              <label htmlFor="role" className="form-label">
                Register As
              </label>
              <select
                className="form-select"
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="user">User</option>
                <option value="worker">Worker</option>
              </select>
            </div>
          )}
          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? <Spinner /> : isLogin ? "Login" : "Signup"}
          </button>
        </form>
        <p className="text-center mt-3 mb-0">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            className="btn btn-link p-0 align-baseline"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? "Signup here" : "Login here"}
          </button>
        </p>
      </div>
      <Toast
        message={toastMessage}
        type={toastType}
        show={showToast}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
}

export default Login;

"use client"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import Navbar from "./components/Navbar"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Bookings from "./pages/Bookings"
import WorkerPanel from "./pages/WorkerPanel"
import AdminDashboard from "./pages/AdminDashboard"
import { AuthProvider, useAuth } from "./context/AuthContext"

// A private route component to protect routes
const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  if (!user) {
    // Not logged in, redirect to login page
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Logged in but unauthorized role, redirect to home or a specific unauthorized page
    return <Navigate to="/" replace />
  }

  return children
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <div className="container mt-4">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Home />} />
            <Route
              path="/bookings"
              element={
                <PrivateRoute allowedRoles={["user"]}>
                  <Bookings />
                </PrivateRoute>
              }
            />
            <Route
              path="/worker-panel"
              element={
                <PrivateRoute allowedRoles={["worker"]}>
                  <WorkerPanel />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin-dashboard"
              element={
                <PrivateRoute allowedRoles={["admin"]}>
                  <AdminDashboard />
                </PrivateRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App

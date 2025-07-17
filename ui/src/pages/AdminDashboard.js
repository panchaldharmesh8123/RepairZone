"use client"

import { useState, useEffect } from "react"
import Spinner from "../components/Spinner"
import Toast from "../components/Toast"
import { apiCall } from "../api"
import { useAuth } from "../context/AuthContext"
import { PlusCircle, Edit, Trash2 } from "lucide-react"

function AdminDashboard() {
  const { user } = useAuth()
  const [tab, setTab] = useState("users") // users, services, workers
  const [loading, setLoading] = useState(true)
  const [toastMessage, setToastMessage] = useState("")
  const [toastType, setToastType] = useState("success")
  const [showToast, setShowToast] = useState(false)

  // State for data management
  const [users, setUsers] = useState([])
  const [services, setServices] = useState([])
  const [workers, setWorkers] = useState([])

  // State for forms (add/edit)
  const [showUserForm, setShowUserForm] = useState(false)
  const [currentUserData, setCurrentUserData] = useState({ id: null, name: "", email: "", password: "", role: "user" })

  const [showServiceForm, setShowServiceForm] = useState(false)
  const [currentServiceData, setCurrentServiceData] = useState({ id: null, name: "", iconPath: "" })

  const [showWorkerForm, setShowWorkerForm] = useState(false)
  const [currentWorkerData, setCurrentWorkerData] = useState({
    id: null,
    name: "",
    email: "",
    password: "",
    availableServices: [],
  })

  useEffect(() => {
    if (user && user.role === "admin") {
      fetchData(tab)
    }
  }, [user, tab])

  const showToastMessage = (message, type) => {
    setToastMessage(message)
    setToastType(type)
    setShowToast(true)
  }

  const fetchData = async (currentTab) => {
    setLoading(true)
    try {
      let data
      if (currentTab === "users") {
        data = await apiCall("/api/admin/users", "GET", null, localStorage.getItem("token"))
        setUsers(data)
      } else if (currentTab === "services") {
        data = await apiCall("/api/admin/services", "GET", null, localStorage.getItem("token"))
        setServices(data)
      } else if (currentTab === "workers") {
        data = await apiCall("/api/admin/workers", "GET", null, localStorage.getItem("token"))
        setWorkers(data)
      }
    } catch (error) {
      console.error(`Error fetching ${currentTab}:`, error)
      showToastMessage(`Failed to load ${currentTab}.`, "error")
    } finally {
      setLoading(false)
    }
  }

  // User Management
  const handleAddUser = () => {
    setCurrentUserData({ id: null, name: "", email: "", password: "", role: "user" })
    setShowUserForm(true)
  }

  const handleEditUser = (user) => {
    setCurrentUserData({ id: user._id, name: user.name, email: user.email, password: "", role: user.role })
    setShowUserForm(true)
  }

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await apiCall(`/api/admin/users/${userId}`, "DELETE", null, localStorage.getItem("token"))
        showToastMessage("User deleted successfully!", "success")
        fetchData("users")
      } catch (error) {
        console.error("Error deleting user:", error)
        showToastMessage("Failed to delete user.", "error")
      }
    }
  }

  const handleSaveUser = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (currentUserData.id) {
        // Update user
        await apiCall(`/api/admin/users/${currentUserData.id}`, "PUT", currentUserData, localStorage.getItem("token"))
        showToastMessage("User updated successfully!", "success")
      } else {
        // Add new user
        await apiCall("/api/admin/users", "POST", currentUserData, localStorage.getItem("token"))
        showToastMessage("User added successfully!", "success")
      }
      setShowUserForm(false)
      fetchData("users")
    } catch (error) {
      console.error("Error saving user:", error)
      showToastMessage(error.message || "Failed to save user.", "error")
    } finally {
      setLoading(false)
    }
  }

  // Service Management
  const handleAddService = () => {
    setCurrentServiceData({ id: null, name: "", iconPath: "" })
    setShowServiceForm(true)
  }

  const handleEditService = (service) => {
    setCurrentServiceData({ id: service._id, name: service.name, iconPath: service.iconPath || "" })
    setShowServiceForm(true)
  }

  const handleDeleteService = async (serviceId) => {
    if (window.confirm("Are you sure you want to delete this service?")) {
      try {
        await apiCall(`/api/admin/services/${serviceId}`, "DELETE", null, localStorage.getItem("token"))
        showToastMessage("Service deleted successfully!", "success")
        fetchData("services")
      } catch (error) {
        console.error("Error deleting service:", error)
        showToastMessage("Failed to delete service.", "error")
      }
    }
  }

  const handleSaveService = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (currentServiceData.id) {
        // Update service
        await apiCall(
          `/api/admin/services/${currentServiceData.id}`,
          "PUT",
          currentServiceData,
          localStorage.getItem("token"),
        )
        showToastMessage("Service updated successfully!", "success")
      } else {
        // Add new service
        await apiCall("/api/admin/services", "POST", currentServiceData, localStorage.getItem("token"))
        showToastMessage("Service added successfully!", "success")
      }
      setShowServiceForm(false)
      fetchData("services")
    } catch (error) {
      console.error("Error saving service:", error)
      showToastMessage(error.message || "Failed to save service.", "error")
    } finally {
      setLoading(false)
    }
  }

  // Worker Management (similar to user management, but with availableServices)
  const handleAddWorker = () => {
    setCurrentWorkerData({ id: null, name: "", email: "", password: "", availableServices: [] })
    setShowWorkerForm(true)
  }

  const handleEditWorker = (worker) => {
    setCurrentWorkerData({
      id: worker._id,
      name: worker.name,
      email: worker.email,
      password: "",
      availableServices: worker.availableServices.map((s) => s._id || s.toString()),
    })
    setShowWorkerForm(true)
  }

  const handleDeleteWorker = async (workerId) => {
    if (window.confirm("Are you sure you want to delete this worker?")) {
      try {
        await apiCall(`/api/admin/workers/${workerId}`, "DELETE", null, localStorage.getItem("token"))
        showToastMessage("Worker deleted successfully!", "success")
        fetchData("workers")
      } catch (error) {
        console.error("Error deleting worker:", error)
        showToastMessage("Failed to delete worker.", "error")
      }
    }
  }

  const handleSaveWorker = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (currentWorkerData.id) {
        // Update worker
        await apiCall(
          `/api/admin/workers/${currentWorkerData.id}`,
          "PUT",
          { ...currentWorkerData, role: "worker" },
          localStorage.getItem("token"),
        )
        showToastMessage("Worker updated successfully!", "success")
      } else {
        // Add new worker
        await apiCall(
          "/api/admin/workers",
          "POST",
          { ...currentWorkerData, role: "worker" },
          localStorage.getItem("token"),
        )
        showToastMessage("Worker added successfully!", "success")
      }
      setShowWorkerForm(false)
      fetchData("workers")
    } catch (error) {
      console.error("Error saving worker:", error)
      showToastMessage(error.message || "Failed to save worker.", "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card shadow-sm p-4">
      <h2 className="h4 mb-4">Admin Dashboard</h2>

      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button className={`nav-link ${tab === "users" ? "active" : ""}`} onClick={() => setTab("users")}>
            Manage Users
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${tab === "services" ? "active" : ""}`} onClick={() => setTab("services")}>
            Manage Services
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${tab === "workers" ? "active" : ""}`} onClick={() => setTab("workers")}>
            Manage Workers
          </button>
        </li>
      </ul>

      {loading ? (
        <Spinner />
      ) : (
        <div>
          {tab === "users" && (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">Users</h5>
                <button className="btn btn-primary btn-sm" onClick={handleAddUser}>
                  <PlusCircle size={16} className="me-1" /> Add User
                </button>
              </div>
              {showUserForm && (
                <div className="card mb-3 p-3">
                  <h6 className="mb-3">{currentUserData.id ? "Edit User" : "Add User"}</h6>
                  <form onSubmit={handleSaveUser}>
                    <div className="mb-3">
                      <label className="form-label">Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={currentUserData.name}
                        onChange={(e) => setCurrentUserData({ ...currentUserData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        value={currentUserData.email}
                        onChange={(e) => setCurrentUserData({ ...currentUserData, email: e.target.value })}
                        required
                      />
                    </div>
                    {!currentUserData.id && ( // Only show password field for new users
                      <div className="mb-3">
                        <label className="form-label">Password</label>
                        <input
                          type="password"
                          className="form-control"
                          value={currentUserData.password}
                          onChange={(e) => setCurrentUserData({ ...currentUserData, password: e.target.value })}
                          required={!currentUserData.id}
                        />
                      </div>
                    )}
                    <div className="mb-3">
                      <label className="form-label">Role</label>
                      <select
                        className="form-select"
                        value={currentUserData.role}
                        onChange={(e) => setCurrentUserData({ ...currentUserData, role: e.target.value })}
                      >
                        <option value="user">User</option>
                        <option value="worker">Worker</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    <button type="submit" className="btn btn-success me-2">
                      {currentUserData.id ? "Update" : "Save"}
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={() => setShowUserForm(false)}>
                      Cancel
                    </button>
                  </form>
                </div>
              )}
              {users.length === 0 ? (
                <p>No users found.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u._id}>
                          <td>{u.name}</td>
                          <td>{u.email}</td>
                          <td>{u.role}</td>
                          <td>
                            <button className="btn btn-info btn-sm me-2" onClick={() => handleEditUser(u)}>
                              <Edit size={14} />
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDeleteUser(u._id)}>
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {tab === "services" && (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">Services</h5>
                <button className="btn btn-primary btn-sm" onClick={handleAddService}>
                  <PlusCircle size={16} className="me-1" /> Add Service
                </button>
              </div>
              {showServiceForm && (
                <div className="card mb-3 p-3">
                  <h6 className="mb-3">{currentServiceData.id ? "Edit Service" : "Add Service"}</h6>
                  <form onSubmit={handleSaveService}>
                    <div className="mb-3">
                      <label className="form-label">Service Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={currentServiceData.name}
                        onChange={(e) => setCurrentServiceData({ ...currentServiceData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Icon Path (e.g., 'plumbing.png')</label>
                      <input
                        type="text"
                        className="form-control"
                        value={currentServiceData.iconPath}
                        onChange={(e) => setCurrentServiceData({ ...currentServiceData, iconPath: e.target.value })}
                        placeholder="Not used with Lucide, but stored for consistency"
                      />
                    </div>
                    <button type="submit" className="btn btn-success me-2">
                      {currentServiceData.id ? "Update" : "Save"}
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={() => setShowServiceForm(false)}>
                      Cancel
                    </button>
                  </form>
                </div>
              )}
              {services.length === 0 ? (
                <p>No services found.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {services.map((s) => (
                        <tr key={s._id}>
                          <td>{s.name}</td>
                          <td>
                            <button className="btn btn-info btn-sm me-2" onClick={() => handleEditService(s)}>
                              <Edit size={14} />
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDeleteService(s._id)}>
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {tab === "workers" && (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">Workers</h5>
                <button className="btn btn-primary btn-sm" onClick={handleAddWorker}>
                  <PlusCircle size={16} className="me-1" /> Add Worker
                </button>
              </div>
              {showWorkerForm && (
                <div className="card mb-3 p-3">
                  <h6 className="mb-3">{currentWorkerData.id ? "Edit Worker" : "Add Worker"}</h6>
                  <form onSubmit={handleSaveWorker}>
                    <div className="mb-3">
                      <label className="form-label">Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={currentWorkerData.name}
                        onChange={(e) => setCurrentWorkerData({ ...currentWorkerData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        value={currentWorkerData.email}
                        onChange={(e) => setCurrentWorkerData({ ...currentWorkerData, email: e.target.value })}
                        required
                      />
                    </div>
                    {!currentWorkerData.id && (
                      <div className="mb-3">
                        <label className="form-label">Password</label>
                        <input
                          type="password"
                          className="form-control"
                          value={currentWorkerData.password}
                          onChange={(e) => setCurrentWorkerData({ ...currentWorkerData, password: e.target.value })}
                          required={!currentWorkerData.id}
                        />
                      </div>
                    )}
                    <div className="mb-3">
                      <label className="form-label">Available Services</label>
                      {services.map((s) => (
                        <div className="form-check" key={s._id}>
                          <input
                            className="form-check-input"
                            type="checkbox"
                            value={s._id}
                            checked={currentWorkerData.availableServices.includes(s._id)}
                            onChange={(e) => {
                              const serviceId = e.target.value
                              setCurrentWorkerData((prevData) => ({
                                ...prevData,
                                availableServices: e.target.checked
                                  ? [...prevData.availableServices, serviceId]
                                  : prevData.availableServices.filter((id) => id !== serviceId),
                              }))
                            }}
                            id={`workerService-${s._id}`}
                          />
                          <label className="form-check-label" htmlFor={`workerService-${s._id}`}>
                            {s.name}
                          </label>
                        </div>
                      ))}
                    </div>
                    <button type="submit" className="btn btn-success me-2">
                      {currentWorkerData.id ? "Update" : "Save"}
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={() => setShowWorkerForm(false)}>
                      Cancel
                    </button>
                  </form>
                </div>
              )}
              {workers.length === 0 ? (
                <p>No workers found.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Services</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {workers.map((w) => (
                        <tr key={w._id}>
                          <td>{w.name}</td>
                          <td>{w.email}</td>
                          <td>{w.availableServices.map((s) => s.name).join(", ")}</td>
                          <td>
                            <button className="btn btn-info btn-sm me-2" onClick={() => handleEditWorker(w)}>
                              <Edit size={14} />
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDeleteWorker(w._id)}>
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      <Toast message={toastMessage} type={toastType} show={showToast} onClose={() => setShowToast(false)} />
    </div>
  )
}

export default AdminDashboard

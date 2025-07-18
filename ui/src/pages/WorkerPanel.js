"use client"

import { useState, useEffect } from "react"
import Spinner from "../components/Spinner"
import Toast from "../components/Toast"
import { apiCall } from "../api"
import { useAuth } from "../context/AuthContext"

function WorkerPanel() {
  const { user } = useAuth()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [toastMessage, setToastMessage] = useState("")
  const [toastType, setToastType] = useState("success")
  const [showToast, setShowToast] = useState(false)

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true)
      try {
        const response = await apiCall("/api/worker/requests", "GET", null, localStorage.getItem("token"))
        setRequests(response)
      } catch (error) {
        console.error("Error fetching worker requests:", error)
        showToastMessage("Failed to load service requests.", "error")
      } finally {
        setLoading(false)
      }
    }

    if (user && user.role === "worker") {
      fetchRequests()
    }
  }, [user])

  const showToastMessage = (message, type) => {
    setToastMessage(message)
    setToastType(type)
    setShowToast(true)
  }

  const handleUpdateStatus = async (bookingId, status) => {
    setLoading(true)
    try {
      await apiCall(`/api/worker/requests/${bookingId}`, "PUT", { status }, localStorage.getItem("token"))
      setRequests(requests.map((req) => (req._id === bookingId ? { ...req, status: status, worker: user } : req)))
      showToastMessage(`Booking ${status.toLowerCase()} successfully!`, "success")
    } catch (error) {
      console.error("Error updating booking status:", error)
      showToastMessage("Failed to update booking status.", "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card shadow-sm p-4">
      <h2 className="h4 mb-4">Worker Panel - Service Requests</h2>
      {loading ? (
        <Spinner />
      ) : requests.length === 0 ? (
        <p>No new service requests.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th scope="col">Service</th>
                <th scope="col">Date</th>
                <th scope="col">Time</th>
                <th scope="col">Customer</th>
                <th scope="col">Phone</th>
                <th scope="col">Address</th>
                <th scope="col">Status</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req._id} className="booking-row">
                  <td>{req.service.name}</td>
                  <td>{new Date(req.date).toLocaleDateString()}</td>
                  <td>{req.time}</td>
                  <td>{req.user.name}</td>
                  <td>{req.phoneNumber}</td>
                  <td>{req.address}</td>
                  <td>
                    <span
                      className={`badge ${
                        req.status === "Pending"
                          ? "bg-secondary"
                          : req.status === "Confirmed"
                            ? "bg-primary"
                            : req.status === "In Progress"
                              ? "bg-info text-dark"
                              : req.status === "Completed"
                                ? "bg-success"
                                : "bg-danger"
                      }`}
                    >
                      {req.status}
                    </span>
                  </td>
                  <td>
                    {req.status === "Pending" && (
                      <>
                        <button
                          className="btn btn-success btn-sm me-2 animate-button"
                          onClick={() => handleUpdateStatus(req._id, "Confirmed")}
                        >
                          Confirm
                        </button>
                        <button
                          className="btn btn-danger btn-sm animate-button"
                          onClick={() => handleUpdateStatus(req._id, "Rejected")}
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {req.status === "Confirmed" && (
                      <button
                        className="btn btn-info btn-sm text-dark animate-button"
                        onClick={() => handleUpdateStatus(req._id, "In Progress")}
                      >
                        Start Job
                      </button>
                    )}
                    {req.status === "In Progress" && (
                      <button
                        className="btn btn-success btn-sm animate-button"
                        onClick={() => handleUpdateStatus(req._id, "Completed")}
                      >
                        Complete Job
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Toast message={toastMessage} type={toastType} show={showToast} onClose={() => setShowToast(false)} />
    </div>
  )
}

export default WorkerPanel

"use client"

import { useState, useEffect } from "react"
import Spinner from "../components/Spinner"
import Toast from "../components/Toast"
import { apiCall } from "../api"
import { useAuth } from "../context/AuthContext"

function Bookings() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [toastMessage, setToastMessage] = useState("")
  const [toastType, setToastType] = useState("success")
  const [showToast, setShowToast] = useState(false)

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true)
      try {
        const response = await apiCall("/api/bookings/my-bookings", "GET", null, localStorage.getItem("token"))
        setBookings(response)
      } catch (error) {
        console.error("Error fetching bookings:", error)
        showToastMessage("Failed to load your bookings.", "error")
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchBookings()
    }
  }, [user])

  const showToastMessage = (message, type) => {
    setToastMessage(message)
    setToastType(type)
    setShowToast(true)
  }

  return (
    <div className="card shadow-sm p-4">
      <h2 className="h4 mb-4">My Bookings</h2>
      {loading ? (
        <Spinner />
      ) : bookings.length === 0 ? (
        <p>You have no bookings yet.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th scope="col">Service</th>
                <th scope="col">Date</th>
                <th scope="col">Time</th>
                <th scope="col">Phone</th>
                <th scope="col">Address</th> 
                <th scope="col">Status</th>
                <th scope="col">Worker</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking._id} className="booking-row">
                  <td>{booking.service.name}</td>
                  <td>{new Date(booking.date).toLocaleDateString()}</td>
                  <td>{booking.time}</td>
                  <td>{booking.phoneNumber}</td>
                  <td>{booking.address}</td>
                  <td>
                    <span
                      className={`badge ${
                        booking.status === "Pending"
                          ? "bg-secondary"
                          : booking.status === "Confirmed"
                            ? "bg-primary"
                            : booking.status === "In Progress"
                              ? "bg-info text-dark"
                              : booking.status === "Completed"
                                ? "bg-success"
                                : "bg-danger"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </td>
                  <td>{booking.worker ? booking.worker.name : "N/A"}</td>
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

export default Bookings

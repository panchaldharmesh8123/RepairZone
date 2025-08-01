"use client";

import { useState, useEffect } from "react";
import Spinner from "../components/Spinner";
import Toast from "../components/Toast";
import { apiCall } from "../api";
import { useAuth } from "../context/AuthContext";

function WorkerPanel() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");
  const [showToast, setShowToast] = useState(false);
  const [localPayments, setLocalPayments] = useState([]);

  // ✅ Fetch stored paid bookings from localStorage
  useEffect(() => {
    const storedPayments =
      JSON.parse(localStorage.getItem("paidBookings")) || [];
    setLocalPayments(storedPayments);
  }, []);

  // ✅ Fetch worker service requests
  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await apiCall(
        "/api/worker/requests",
        "GET",
        null,
        localStorage.getItem("token")
      );

      // Merge payment status with localStorage data
      const updatedRequests = response.map((req) => ({
        ...req,
        paymentStatus:
          req.paymentStatus === "Paid" || localPayments.includes(req._id)
            ? "Paid"
            : "Unpaid",
      }));

      setRequests(updatedRequests);
    } catch (error) {
      console.error("Error fetching worker requests:", error);
      showToastMessage("Failed to load service requests.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === "worker") {
      fetchRequests();
    }
  }, [user, localPayments]); // re-check when local storage updates

  const showToastMessage = (message, type) => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  // ✅ Update booking status with payment check
  const handleUpdateStatus = async (bookingId, status, paymentStatus) => {
    if (
      paymentStatus !== "Paid" &&
      (status === "Confirmed" || status === "In Progress")
    ) {
      showToastMessage(
        "Cannot proceed. Payment has not been made by the customer.",
        "error"
      );
      return;
    }

    setLoading(true);
    try {
      await apiCall(
        `/api/worker/requests/${bookingId}`,
        "PUT",
        { status },
        localStorage.getItem("token")
      );

      // Refresh latest data
      await fetchRequests();
      showToastMessage(
        `Booking ${status.toLowerCase()} successfully!`,
        "success"
      );
    } catch (error) {
      console.error("Error updating booking status:", error);
      showToastMessage("Failed to update booking status.", "error");
    } finally {
      setLoading(false);
    }
  };

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
                <th>Service</th>
                <th>Date</th>
                <th>Time</th>
                <th>Customer</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req._id} className="booking-row">
                  <td>{req.service?.name || "N/A"}</td>
                  <td>{new Date(req.date).toLocaleDateString()}</td>
                  <td>{req.time}</td>
                  <td>{req.user?.name || "N/A"}</td>
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
                    <span
                      className={`badge ${
                        req.paymentStatus === "Paid"
                          ? "bg-success"
                          : "bg-danger"
                      }`}
                    >
                      {req.paymentStatus}
                    </span>
                  </td>
                  <td>
                    {req.status === "Pending" && (
                      <>
                        <button
                          className="btn btn-success btn-sm me-2 animate-button"
                          onClick={() =>
                            handleUpdateStatus(
                              req._id,
                              "Confirmed",
                              req.paymentStatus
                            )
                          }
                        >
                          Confirm
                        </button>
                        <button
                          className="btn btn-danger btn-sm animate-button"
                          onClick={() =>
                            handleUpdateStatus(
                              req._id,
                              "Rejected",
                              req.paymentStatus
                            )
                          }
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {req.status === "Confirmed" && (
                      <button
                        className="btn btn-info btn-sm text-dark animate-button"
                        onClick={() =>
                          handleUpdateStatus(
                            req._id,
                            "In Progress",
                            req.paymentStatus
                          )
                        }
                        disabled={req.paymentStatus !== "Paid"}
                      >
                        Start Job
                      </button>
                    )}
                    {req.status === "In Progress" && (
                      <button
                        className="btn btn-success btn-sm animate-button"
                        onClick={() =>
                          handleUpdateStatus(
                            req._id,
                            "Completed",
                            req.paymentStatus
                          )
                        }
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
      <Toast
        message={toastMessage}
        type={toastType}
        show={showToast}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
}

export default WorkerPanel;

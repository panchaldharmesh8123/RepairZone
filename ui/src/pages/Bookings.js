"use client";

import { useState, useEffect } from "react";
import Spinner from "../components/Spinner";
import Toast from "../components/Toast";
import { apiCall } from "../api";
import { useAuth } from "../context/AuthContext";
import jsPDF from "jspdf";

function Bookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");
  const [showToast, setShowToast] = useState(false);
  const [paymentInProgress, setPaymentInProgress] = useState(null);
  const [paidBookings, setPaidBookings] = useState([]);

  const upiId = "dharmeshpanchal3236@oksbi";
  const payeeName = "RepairZone";

  // ✅ Handle UPI Payment
  const handleUPIPayment = (booking) => {
    const amount = "1200"; // Fixed or dynamic
    const note = `Payment for booking ${booking._id}`;
    const upiUrl = `upi://pay?pa=${encodeURIComponent(
      upiId
    )}&pn=${encodeURIComponent(payeeName)}&am=${amount}&tn=${encodeURIComponent(
      note
    )}&cu=INR`;

    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isMobile) {
      window.location.href = upiUrl;
    } else {
      window.open(
        `https://pay.google.com/gp/p/u/?pa=${encodeURIComponent(
          upiId
        )}&pn=${encodeURIComponent(
          payeeName
        )}&am=${amount}&tn=${encodeURIComponent(note)}&cu=INR`,
        "_blank"
      );
    }

    setPaymentInProgress(booking._id); // Show confirm button
  };

  // ✅ Confirm Payment
  const confirmPayment = (booking) => {
    setPaidBookings((prev) => [...prev, booking._id]);
    generateReceiptPDF(booking, user, { mode: "UPI", amount: 1200 });
    showToastMessage("Payment successful! Receipt downloaded.", "success");
    setPaymentInProgress(null);
  };

  // ✅ Fetch bookings from API
  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const response = await apiCall(
          "/api/bookings/my-bookings",
          "GET",
          null,
          localStorage.getItem("token")
        );
        setBookings(response);
      } catch (error) {
        console.error("Error fetching bookings:", error);
        showToastMessage("Failed to load your bookings.", "error");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchBookings();
    }
  }, [user]);

  const showToastMessage = (message, type) => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  // ✅ Generate PDF Receipt
  const generateReceiptPDF = (booking, user, payment) => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 40;
    let currentY = margin;

    // Background
    doc.setFillColor(245, 245, 245);
    doc.rect(margin / 2, margin / 2, pageWidth - margin, 750, "F");

    // Header
    doc.setFillColor(30, 144, 255);
    doc.rect(0, 0, pageWidth, 70, "F");

    doc.setFontSize(26);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text("RepairZone", margin, 45);

    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.text("Service Receipt", pageWidth - margin - 120, 45);

    currentY = 100;

    // Booking Details Title
    doc.setFontSize(18);
    doc.setTextColor(30, 144, 255);
    doc.setFont("helvetica", "bold");
    doc.text("Booking Details", margin, currentY);

    currentY += 20;
    doc.setDrawColor(200);
    doc.line(margin, currentY, pageWidth - margin, currentY);

    currentY += 20;

    // Booking info
    const info = [
      { label: "Receipt ID", value: booking?._id || "N/A" },
      { label: "Customer Name", value: user?.name || "N/A" },
      { label: "Phone Number", value: booking?.phoneNumber || "N/A" },
      { label: "Address", value: booking?.address || "N/A" },
      { label: "Service", value: booking?.service?.name || "N/A" },
      {
        label: "Date",
        value: booking?.date
          ? new Date(booking.date).toLocaleDateString()
          : "N/A",
      },
      { label: "Worker", value: booking?.worker?.name || "N/A" },
      { label: "Time", value: booking?.time || "N/A" },
      { label: "Status", value: booking?.status || "N/A" },
      { label: "Payment Mode", value: payment?.mode || "N/A" },
      {
        label: "Amount Paid",
        value: payment?.amount ? `${payment.amount.toFixed(2)}Rs` : "N/A",
      },
    ];

    doc.setFontSize(12);
    doc.setTextColor(50);

    const labelX = margin + 10;
    const valueX = margin + 180;
    const lineHeight = 22;

    info.forEach(({ label, value }) => {
      doc.setFont("helvetica", "bold");
      doc.text(`${label}:`, labelX, currentY);
      doc.setFont("helvetica", "normal");
      doc.text(`${value}`, valueX, currentY);
      currentY += lineHeight;
    });

    // Footer
    currentY += 20;
    doc.setDrawColor(200);
    doc.line(margin, currentY, pageWidth - margin, currentY);

    doc.setFontSize(10);
    doc.setTextColor(100);
    currentY += 25;
    doc.text("Thank you for booking with RepairZone!", margin, currentY);

    doc.setFontSize(9);
    currentY += 15;
    doc.text(
      "For inquiries, contact support@repairzone.com or call +91 9998460334.",
      margin,
      currentY
    );

    doc.save(`RepairZone_Receipt_${booking._id}.pdf`);
  };

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
                <th>Service</th>
                <th>Date</th>
                <th>Time</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Status</th>
                <th>Worker</th>
                <th>Payment Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking._id}>
                  <td>{booking.service?.name || "N/A"}</td>
                  <td>
                    {booking.date
                      ? new Date(booking.date).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td>{booking.time || "N/A"}</td>
                  <td>{booking.phoneNumber || "N/A"}</td>
                  <td>{booking.address || "N/A"}</td>
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
                      {booking.status || "N/A"}
                    </span>
                  </td>
                  <td>{booking.worker?.name || "N/A"}</td>
                  <td>
                    {booking.paymentStatus === "Paid" ||
                    paidBookings.includes(booking._id) ? (
                      <span className="badge bg-success">Paid</span>
                    ) : (
                      <>
                        {/* <span className="badge bg-danger">Unpaid</span> */}
                        {paymentInProgress === booking._id ? (
                          <button
                            className="btn btn-warning btn-sm mt-1"
                            onClick={() => confirmPayment(booking)}
                          >
                            ✅ Confirm Payment & Download Receipt
                          </button>
                        ) : (
                          <button
                            className="btn btn-success btn-sm mt-1"
                            onClick={() => handleUPIPayment(booking)}
                            disabled={
                              paidBookings.includes(booking._id) ||
                              booking.status === "Completed" ||
                              booking.status === "Rejected" ||
                              booking.status === "In Progress"
                            }
                          >
                            Pay Now (UPI)
                          </button>
                        )}
                      </>
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

export default Bookings;

"use client";

import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Hand,
  Car,
  Wrench,
  Hammer,
  Snowflake,
  Plug,
  Lightbulb,
  Factory,
  ScrollText,
  Building,
} from "lucide-react"; // Import various icons
import Spinner from "../components/Spinner";
import Toast from "../components/Toast";
import { useAuth } from "../context/AuthContext";
import { apiCall } from "../api";

const serviceIcons = {
  Plumbing: Wrench,
  "AC Repair": Snowflake,
  Electrician: Plug,
  Carpentry: Hammer,
  Automotive: Car,
  Handyman: Hand,
  "Home Cleaning": Building,
  "Appliance Repair": Lightbulb,
  "Document Services": ScrollText,
  "Industrial Services": Factory,
};

function Home() {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [loadingBooking, setLoadingBooking] = useState(false);
  const [selectedService, setSelectedService] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [bookingStatus, setBookingStatus] = useState(null); // { message: string, type: 'success' | 'error' }
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await apiCall("/api/services", "GET");
        setServices(response);
        if (response.length > 0) {
          setSelectedService(response[0]._id); // Pre-select the first service
        }
      } catch (error) {
        console.error("Error fetching services:", error);
        showToastMessage("Failed to load services.", "error");
      } finally {
        setLoadingServices(false);
      }
    };

    fetchServices();

    // Set default date and time
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    setBookingDate(`${yyyy}-${mm}-${dd}`);
    setBookingTime("09:00"); // Default time
  }, []);

  const showToastMessage = (message, type) => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!user) {
      showToastMessage("Please login to book a service.", "error");
      return;
    }
    if (
      !selectedService ||
      !bookingDate ||
      !bookingTime ||
      !phoneNumber ||
      !address
    ) {
      showToastMessage(
        "Please fill all booking details including phone and address.",
        "error"
      );
      return;
    }

    setLoadingBooking(true);
    setBookingStatus(null); // Clear previous status

    try {
      const response = await apiCall(
        "/api/bookings",
        "POST",
        {
          serviceId: selectedService,
          date: bookingDate,
          time: bookingTime,
          phoneNumber, // Add phone number
          address, // Add address
        },
        localStorage.getItem("token")
      );

      showToastMessage("Service booked successfully!", "success");
      setBookingStatus({ message: "Booking Confirmed!", type: "success" });
      // Optionally clear form fields after successful booking
      setPhoneNumber("");
      setAddress("");
    } catch (error) {
      console.error("Booking failed:", error);
      showToastMessage(error.message || "Failed to book service.", "error");
      setBookingStatus({
        message: error.message || "Booking Failed!",
        type: "error",
      });
    } finally {
      setLoadingBooking(false);
    }
  };

  return (
    <div className="card shadow-sm p-4">
      <h1 className="h4 mb-4">RepairZone – Service Booking Web Application</h1>

      <div className="mb-4">
        <h2 className="h5 mb-3">Service Listing</h2>
        {loadingServices ? (
          <Spinner />
        ) : (
          <div className="row row-cols-2 row-cols-md-4 g-3">
            {services.map((service) => {
              const IconComponent = serviceIcons[service.name] || Wrench; // Default icon
              return (
                <div key={service._id} className="col">
                  <div className="card h-100 text-center service-card shadow-sm">
                    <div className="card-body d-flex flex-column justify-content-center align-items-center">
                      <IconComponent size={48} className="mb-2 text-primary" />
                      <p className="card-text fw-bold">{service.name}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="row g-4">
        <div className="col-md-6">
          <div className="card shadow-sm p-4">
            <h2 className="h5 mb-3">Booking System</h2>
            <form onSubmit={handleBooking}>
              <div className="mb-3">
                <label htmlFor="serviceSelect" className="form-label">
                  Service
                </label>
                <select
                  className="form-select"
                  id="serviceSelect"
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  required
                >
                  {services.map((service) => (
                    <option key={service._id} value={service._id}>
                      {service.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="row g-3 mb-3">
                <div className="col-6">
                  <label htmlFor="bookingDate" className="form-label">
                    Date
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    id="bookingDate"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    required
                  />
                </div>
                <div className="col-6">
                  <label htmlFor="bookingTime" className="form-label">
                    Time
                  </label>
                  <input
                    type="time"
                    className="form-control"
                    id="bookingTime"
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="mb-3">
                <label htmlFor="phoneNumber" className="form-label">
                  Phone Number
                </label>
                <input
                  type="tel"
                  className="form-control"
                  id="phoneNumber"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="e.g., +1234567890"
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="address" className="form-label">
                  Address
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g., 123 Main St, City, Country"
                  required
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary w-100"
                disabled={loadingBooking}
              >
                {loadingBooking ? <Spinner /> : "Book Service"}
              </button>
            </form>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card shadow-sm p-4 h-100">
            <h2 className="h5 mb-3">Service Report</h2>
            {bookingStatus && bookingStatus.type === "success" ? (
              <div className="p-3 bg-light rounded mb-3">
                <p className="mb-1">
                  <strong>Service:</strong>{" "}
                  {services.find((s) => s._id === selectedService)?.name ||
                    "N/A"}
                </p>
                <p className="mb-1">
                  <strong>Date:</strong> {bookingDate}
                </p>
                <p className="mb-1">
                  <strong>Time:</strong> {bookingTime} AM
                </p>
                <p className="mb-1">
                  <strong>Phone:</strong> {phoneNumber}
                </p>
                <p className="mb-0">
                  <strong>Address:</strong> {address}
                </p>
              </div>
            ) : (
              <p className="text-muted">No recent booking report available.</p>
            )}

            <h2 className="h5 mt-4 mb-3">Booking Status Update</h2>
            <div
              className={`alert booking-status-alert ${
                bookingStatus
                  ? bookingStatus.type === "success"
                    ? "alert-warning"
                    : "alert-danger"
                  : "d-none"
              } fade-in`}
            >
              {bookingStatus && bookingStatus.message}
            </div>
          </div>
        </div>
      </div>

      {user && user.role === "worker" && (
        <div className="card shadow-sm p-4 mt-4">
          <h2 className="h5 mb-3">Worker Panel</h2>
          <p className="text-muted">
            Navigate to "Worker Panel" in the navbar for detailed view.
          </p>
          {/* This section is primarily illustrative, full functionality in WorkerPanel.js */}
        </div>
      )}

      {user && user.role === "admin" && (
        <div className="card shadow-sm p-4 mt-4 ">
          <h2 className="h5 mb-3">Admin Dashboard</h2>
          <ul className="list-unstyled d-flex flex-row flex-wrap gap-2">
            <li>
              <Link to="/admin-dashboard" className=" btn btn-outline-primary ">
                Manage Users
              </Link>
            </li>
            <li>
              <Link to="/admin-dashboard" className="btn btn-outline-danger ">
                Manage Services
              </Link>
            </li>
            <li>
              <Link to="/admin-dashboard" className="btn btn-outline-dark">
                Manage Workers
              </Link>
            </li>
          </ul>
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

export default Home;

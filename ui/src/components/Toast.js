"use client"

import { useState, useEffect } from "react"

function Toast({ message, type, show, onClose }) {
  const [fadeClass, setFadeClass] = useState("")

  useEffect(() => {
    if (show) {
      setFadeClass("show")
      const timer = setTimeout(() => {
        setFadeClass("")
        setTimeout(() => onClose(), 300) // Allow fade-out animation to complete
      }, 3000) // Toast disappears after 3 seconds
      return () => clearTimeout(timer)
    } else {
      setFadeClass("")
    }
  }, [show, onClose])

  if (!show && fadeClass === "") return null

  const alertClass = type === "success" ? "alert-success" : "alert-danger"

  return (
    <div className={`toast-container position-fixed bottom-0 end-0 p-3`} style={{ zIndex: 11 }}>
      <div className={`alert ${alertClass} alert-dismissible fade ${fadeClass}`} role="alert">
        {message}
        <button
          type="button"
          className="btn-close"
          data-bs-dismiss="alert"
          aria-label="Close"
          onClick={onClose}
        ></button>
      </div>
    </div>
  )
}

export default Toast

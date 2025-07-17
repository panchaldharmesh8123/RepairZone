function Spinner() {
  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100px" }}>
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  )
}

export default Spinner

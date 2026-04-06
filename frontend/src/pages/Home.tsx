function Home() {
  return (
    <div className="container py-5">
      <div className="text-center mb-5">
        <h1 className="display-4">Welcome to Nhyira Haven</h1>
        <p className="lead text-muted">Where healing begins</p>
      </div>

      <div className="row g-4">
        <div className="col-md-4">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">Our Mission</h5>
              <p className="card-text">
                Providing safehouses and rehabilitation services for survivors of trafficking and abuse across West Africa.
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">Get Involved</h5>
              <p className="card-text">
                Join us in making a difference. Your support helps us provide care, education, and hope.
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">Our Impact</h5>
              <p className="card-text">
                Track how your contributions are transforming lives through our transparent reporting.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
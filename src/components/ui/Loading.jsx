import React from "react";

// Button loading spinner
export const ButtonLoading = ({ children, loading = false, ...props }) => {
  return (
    <button {...props} disabled={loading || props.disabled}>
      {loading && (
        <span className="spinner-border spinner-border-sm me-2" role="status">
          <span className="visually-hidden">Loading...</span>
        </span>
      )}
      {children}
    </button>
  );
};

// Page loading component
export const PageLoading = ({ message = "Loading..." }) => {
  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="text-center">
        <div
          className="spinner-border text-primary mb-3"
          role="status"
          style={{ width: "3rem", height: "3rem" }}
        >
          <span className="visually-hidden">Loading...</span>
        </div>
        <h5 className="text-muted">{message}</h5>
      </div>
    </div>
  );
};

// Card loading skeleton
export const CardLoading = ({ message = "Loading..." }) => {
  return (
    <div className="d-flex align-items-center justify-content-center py-5">
      <div className="text-center">
        <div className="spinner-border text-primary mb-2" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="text-muted mb-0">{message}</p>
      </div>
    </div>
  );
};

// Table loading skeleton
export const TableLoading = ({ columns = 4, rows = 5 }) => (
  <div className="table-responsive">
    <table className="table">
      <thead>
        <tr>
          {Array.from({ length: columns }).map((_, index) => (
            <th key={index}>
              <div
                className="loading-skeleton"
                style={{ height: "1rem", width: "80%" }}
              ></div>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <tr key={rowIndex}>
            {Array.from({ length: columns }).map((_, colIndex) => (
              <td key={colIndex}>
                <div
                  className="loading-skeleton"
                  style={{
                    height: "1rem",
                    width: `${Math.random() * 30 + 50}%`,
                  }}
                ></div>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// Stats loading component
export const StatsLoading = ({ count = 4 }) => (
  <div className="row g-3">
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="col-md-3">
        <div className="card">
          <div className="card-body text-center">
            <div
              className="loading-skeleton mb-2"
              style={{ height: "2rem", width: "60%", margin: "0 auto" }}
            ></div>
            <div
              className="loading-skeleton"
              style={{ height: "1rem", width: "80%", margin: "0 auto" }}
            ></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Inline loading spinner
export const InlineLoading = ({ size = "sm", className = "" }) => {
  return (
    <span
      className={`spinner-border spinner-border-${size} ${className}`}
      role="status"
    >
      <span className="visually-hidden">Loading...</span>
    </span>
  );
};

// Overlay loading component
export const OverlayLoading = ({
  show = false,
  message = "Loading...",
  backdrop = true,
}) => {
  if (!show) return null;

  return (
    <div
      className={`position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center ${
        backdrop ? "bg-dark bg-opacity-50" : ""
      }`}
      style={{ zIndex: 9999 }}
    >
      <div className="bg-white rounded p-4 shadow-lg text-center">
        <div className="spinner-border text-primary mb-3" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mb-0 text-muted">{message}</p>
      </div>
    </div>
  );
};

// Progress loading bar
export const ProgressLoading = ({
  progress = 0,
  message = "",
  animated = true,
}) => (
  <div className="text-center">
    <div className="progress mb-2" style={{ height: "8px" }}>
      <div
        className={`progress-bar ${animated ? "progress-bar-animated" : ""}`}
        role="progressbar"
        style={{ width: `${progress}%` }}
        aria-valuenow={progress}
        aria-valuemin="0"
        aria-valuemax="100"
      ></div>
    </div>
    {message && <small className="text-muted">{message}</small>}
  </div>
);

// Pulse loading animation
export const PulseLoading = ({
  width = "100%",
  height = "1rem",
  className = "",
}) => (
  <div
    className={`loading-skeleton ${className}`}
    style={{ width, height }}
  ></div>
);

export const ComponentLoading = ({ message = "Loading..." }) => {
  return (
    <div className="d-flex align-items-center justify-content-center py-5">
      <div className="text-center">
        <div
          className="spinner-border spinner-border-sm text-primary mb-2"
          role="status"
        >
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="text-muted small">{message}</p>
      </div>
    </div>
  );
};

export const SkeletonLoader = ({ lines = 3, height = "1rem" }) => {
  return (
    <div className="skeleton-loader">
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className="skeleton-line mb-2"
          style={{ height, width: `${Math.random() * 40 + 60}%` }}
        ></div>
      ))}
    </div>
  );
};

export default {
  PageLoading,
  ComponentLoading,
  InlineLoading,
  ButtonLoading,
  CardLoading,
  SkeletonLoader,
};

import React from "react";

// Button loading spinner
export const ButtonLoading = ({ size = "sm", className = "" }) => (
  <span
    className={`spinner-border spinner-border-${size} me-2 ${className}`}
    role="status"
    aria-hidden="true"
  ></span>
);

// Page loading component
export const PageLoading = ({ message = "Loading...", fullScreen = true }) => (
  <div
    className={`d-flex flex-column justify-content-center align-items-center ${
      fullScreen ? "min-vh-100" : "py-5"
    }`}
  >
    <div
      className="spinner-border text-primary mb-3"
      role="status"
      style={{ width: "3rem", height: "3rem" }}
    >
      <span className="visually-hidden">Loading...</span>
    </div>
    <p className="text-muted">{message}</p>
  </div>
);

// Card loading skeleton
export const CardLoading = ({ rows = 3, showHeader = true }) => (
  <div className="card shadow-sm">
    {showHeader && (
      <div className="card-header">
        <div
          className="loading-skeleton"
          style={{ height: "1.5rem", width: "60%" }}
        ></div>
      </div>
    )}
    <div className="card-body">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="mb-3">
          <div
            className="loading-skeleton"
            style={{ height: "1rem", width: `${Math.random() * 40 + 60}%` }}
          ></div>
        </div>
      ))}
    </div>
  </div>
);

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
export const InlineLoading = ({ size = "sm", text = "", className = "" }) => (
  <div className={`d-flex align-items-center ${className}`}>
    <div className={`spinner-border spinner-border-${size} me-2`} role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
    {text && <span className="text-muted">{text}</span>}
  </div>
);

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

export default {
  ButtonLoading,
  PageLoading,
  CardLoading,
  TableLoading,
  StatsLoading,
  InlineLoading,
  OverlayLoading,
  ProgressLoading,
  PulseLoading,
};

import React from "react";

const DashboardHeader = ({ user, onRefresh, onLogout, loading }) => {
  return (
    <div className="row mb-4">
      <div className="col-12">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1 className="mb-1">
              <i className="bi bi-speedometer2 me-2"></i>
              Admin Dashboard
            </h1>
            <p className="text-muted mb-0">Welcome back, {user?.name}!</p>
          </div>
          <div className="d-flex gap-2">
            <button
              className="btn btn-outline-secondary"
              onClick={onRefresh}
              disabled={loading}
            >
              <i className="bi bi-arrow-clockwise me-1"></i>
              {loading ? "Loading..." : "Refresh"}
            </button>
            <button className="btn btn-outline-danger" onClick={onLogout}>
              <i className="bi bi-box-arrow-right me-1"></i>
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;

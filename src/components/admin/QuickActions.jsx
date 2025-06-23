import React from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const QuickActions = ({ onExportData, hasData }) => {
  return (
    <div className="row mb-4">
      <div className="col-12">
        <div className="card">
          <div className="card-header">
            <h5 className="mb-0">
              <i className="bi bi-lightning me-1"></i>
              Quick Actions
            </h5>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-3 mb-2">
                <Link
                  to="/admin/employees"
                  className="btn btn-outline-primary w-100"
                >
                  <i className="bi bi-person-plus me-1"></i>
                  Manage Employees
                </Link>
              </div>
              <div className="col-md-3 mb-2">
                <Link
                  to="/admin/attendance"
                  className="btn btn-outline-success w-100"
                >
                  <i className="bi bi-calendar-check me-1"></i>
                  View All Attendance
                </Link>
              </div>
              <div className="col-md-3 mb-2">
                <button
                  className="btn btn-outline-success w-100"
                  onClick={onExportData}
                  disabled={!hasData}
                >
                  <i className="bi bi-download me-1"></i>
                  Export Data
                </button>
              </div>
              <div className="col-md-3 mb-2">
                <button
                  className="btn btn-outline-info w-100"
                  onClick={() => toast.info("Reports feature coming soon!")}
                >
                  <i className="bi bi-file-earmark-text me-1"></i>
                  Generate Reports
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;

import React from "react";
import { useAuth } from "../../contexts/AuthContext";

const AdminDashboardPage = () => {
  const { user, logout } = useAuth();

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1>Admin Dashboard</h1>
            <button className="btn btn-outline-danger" onClick={logout}>
              Logout
            </button>
          </div>

          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Welcome Admin, {user?.name}!</h5>
              <p className="card-text">
                <strong>Email:</strong> {user?.email}
                <br />
                <strong>Position:</strong> {user?.position}
                <br />
                <strong>Role:</strong> {user?.role}
              </p>
              <div className="mt-3">
                <h6>Admin Features:</h6>
                <ul>
                  <li>Manage Employees</li>
                  <li>View All Attendance Records</li>
                  <li>Generate Reports</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;

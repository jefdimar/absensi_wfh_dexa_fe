import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Link } from "react-router-dom";

// Components

import {
  DashboardHeader,
  DateFilter,
  StatsCards,
  QuickActions,
  AttendanceTable,
  DebugPanel,
} from "../../components/admin";

// Hooks
import { useAdminDashboard } from "../../hooks";

// Utils

import {
  getDerivedStats,
  formatDate,
  exportAttendanceData,
  showEmployeeDetails,
  viewEmployeeAttendance,
} from "../../utils";

// Styles
import "../../styles/adminDashboard.css";

const AdminDashboardPage = () => {
  const { user, logout } = useAuth();
  const { stats, loading, selectedDate, handleRefresh, handleDateChange } =
    useAdminDashboard();

  // Calculate derived stats
  const derivedStats = getDerivedStats(stats.recentAttendance);

  // Event handlers
  const handleExportData = () => {
    exportAttendanceData(stats.recentAttendance, selectedDate);
  };

  const handleShowEmployeeDetails = (employee) => {
    showEmployeeDetails(employee);
  };

  const handleViewEmployeeAttendance = (employeeId) => {
    viewEmployeeAttendance(employeeId);
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ height: "50vh" }}
        >
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      {/* Header */}

      <DashboardHeader
        user={user}
        onRefresh={handleRefresh}
        onLogout={logout}
        loading={loading}
      />

      {/* Date Filter */}

      <DateFilter
        selectedDate={selectedDate}
        onDateChange={handleDateChange}
        stats={stats}
      />

      {/* Stats Cards */}
      <StatsCards
        derivedStats={derivedStats}
        stats={stats}
        selectedDate={selectedDate}
        formatDate={formatDate}
      />

      {/* Quick Actions */}

      <QuickActions
        onExportData={handleExportData}
        hasData={stats.recentAttendance.length > 0}
      />

      {/* Recent Attendance */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="bi bi-clock-history me-1"></i>
                Employee Attendance ({formatDate(selectedDate)})
              </h5>
              <div className="d-flex gap-2">
                <span className="badge bg-secondary">
                  {derivedStats.activeEmployees} employees
                </span>
                <Link
                  to="/admin/attendance"
                  className="btn btn-sm btn-outline-primary"
                >
                  View All
                </Link>
              </div>
            </div>
            <div className="card-body">
              <AttendanceTable
                groupedEmployees={derivedStats.groupedEmployees}
                onShowEmployeeDetails={handleShowEmployeeDetails}
                onViewEmployeeAttendance={handleViewEmployeeAttendance}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Debug Panel */}
      <DebugPanel
        user={user}
        stats={stats}
        selectedDate={selectedDate}
        derivedStats={derivedStats}
      />
    </div>
  );
};

export default AdminDashboardPage;

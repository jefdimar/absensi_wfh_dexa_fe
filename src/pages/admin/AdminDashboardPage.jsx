import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { adminService } from "../../services/adminService";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const AdminDashboardPage = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    totalEmployees: 0,
    todayPresent: 0,
    todayAbsent: 0,
    recentAttendance: [],
  });
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // Helper functions - moved to the top
  const calculateDuration = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return "N/A";

    try {
      const start = new Date(checkIn);
      const end = new Date(checkOut);
      const diffMs = end - start;
      const diffHours = diffMs / (1000 * 60 * 60);

      if (diffHours < 0) return "Invalid";

      const hours = Math.floor(diffHours);
      const minutes = Math.floor((diffHours - hours) * 60);

      return `${hours}h ${minutes}m`;
    } catch (error) {
      return "N/A";
    }
  };

  const calculateDurationFromRecords = (currentRecord, allRecords) => {
    if (!currentRecord.employeeId) return "N/A";

    // Find all records for this employee
    const employeeRecords = allRecords.filter(
      (r) => r.employeeId === currentRecord.employeeId
    );

    // Sort by timestamp
    employeeRecords.sort(
      (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
    );

    // Find check-in and check-out pairs
    let checkIn = null;
    let checkOut = null;

    for (const record of employeeRecords) {
      if (record.status === "check-in") {
        checkIn = record;
      } else if (record.status === "check-out" && checkIn) {
        checkOut = record;
        break;
      }
    }

    if (checkIn && checkOut) {
      return calculateDuration(checkIn.timestamp, checkOut.timestamp);
    } else if (checkIn && currentRecord.status === "check-in") {
      // Still working
      return "In Progress";
    }

    return "N/A";
  };

  const groupRecordsByEmployee = (records) => {
    const grouped = {};

    records.forEach((record) => {
      if (!grouped[record.employeeId]) {
        grouped[record.employeeId] = {
          employeeId: record.employeeId,
          employeeName:
            record.employeeName ||
            `Employee ${record.employeeId.substring(0, 8)}`,
          employeeEmail: record.employeeEmail || "N/A",
          records: [],
        };
      }
      grouped[record.employeeId].records.push(record);
    });

    // Sort records by timestamp for each employee
    Object.values(grouped).forEach((employee) => {
      employee.records.sort(
        (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
      );
    });

    return grouped;
  };

  const getEmployeeStatus = (employeeRecords) => {
    if (!employeeRecords || employeeRecords.length === 0) return "absent";

    // Sort by timestamp
    const sorted = [...employeeRecords].sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );
    const latestRecord = sorted[0];

    if (latestRecord.status === "check-in") {
      return "present";
    } else if (latestRecord.status === "check-out") {
      return "completed";
    }

    return "unknown";
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case "present":
      case "check-in":
        return "bg-success";
      case "completed":
      case "check-out":
        return "bg-primary";
      case "absent":
        return "bg-danger";
      case "incomplete":
        return "bg-warning";
      default:
        return "bg-secondary";
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch (error) {
      console.error("Error formatting time:", error);
      return "Invalid Time";
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  const showEmployeeDetails = (employee) => {
    const details = `
Employee: ${employee.employeeName}
ID: ${employee.employeeId}
Email: ${employee.employeeEmail}
Records Today: ${employee.records.length}

Records:
${employee.records
  .map((r) => `• ${r.status} at ${formatTime(r.timestamp)}`)
  .join("\n")}
    `;

    alert(details); // You can replace this with a proper modal later
  };

  const viewEmployeeAttendance = (employeeId) => {
    // Navigate to employee attendance page or show detailed view
    toast.info(
      `Viewing attendance for employee: ${employeeId.substring(0, 8)}...`
    );
    // You can implement navigation to a detailed view here
    // navigate(`/admin/attendance?employeeId=${employeeId}`);
  };

  // Calculate derived stats from attendance data
  const getDerivedStats = () => {
    const groupedEmployees = groupRecordsByEmployee(stats.recentAttendance);
    const activeEmployees = Object.keys(groupedEmployees).length;
    const checkInCount = stats.recentAttendance.filter(
      (r) => r.status === "check-in"
    ).length;
    const checkOutCount = stats.recentAttendance.filter(
      (r) => r.status === "check-out"
    ).length;
    const totalRecords = stats.recentAttendance.length;

    return {
      activeEmployees,
      checkInCount,
      checkOutCount,
      totalRecords,
      groupedEmployees,
    };
  };

  // useEffect and other component logic
  useEffect(() => {
    fetchDashboardData();
  }, [selectedDate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      console.log(
        "AdminDashboard: Fetching dashboard data for date:",
        selectedDate
      );
      const summary = await adminService.getDashboardSummary(selectedDate);
      console.log("AdminDashboard: Dashboard summary received:", summary);

      setStats({
        totalEmployees: summary.totalEmployees || 0,
        todayPresent: summary.presentCount || 0,
        todayAbsent: summary.absentCount || 0,
        recentAttendance: summary.recentAttendance || [],
      });
      console.log("AdminDashboard: Stats updated:", {
        totalEmployees: summary.totalEmployees || 0,
        todayPresent: summary.presentCount || 0,
        todayAbsent: summary.absentCount || 0,
        recentAttendanceCount: (summary.recentAttendance || []).length,
      });
    } catch (error) {
      console.error("AdminDashboard: Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");

      setStats({
        totalEmployees: 0,
        todayPresent: 0,
        todayAbsent: 0,
        recentAttendance: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await fetchDashboardData();
    toast.success("Dashboard data refreshed!");
  };

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    const today = new Date().toISOString().split("T")[0];

    if (newDate > today) {
      toast.error("Cannot select future dates");
      return;
    }

    setSelectedDate(newDate);
    toast.info(`Loading data for ${formatDate(newDate)}...`);
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

  // Get derived stats for rendering
  const derivedStats = getDerivedStats();

  return (
    <div className="container mt-4">
      {/* Header */}
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
                onClick={handleRefresh}
                disabled={loading}
              >
                <i className="bi bi-arrow-clockwise me-1"></i>
                {loading ? "Loading..." : "Refresh"}
              </button>
              <button className="btn btn-outline-danger" onClick={logout}>
                <i className="bi bi-box-arrow-right me-1"></i>
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Date Filter */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <label htmlFor="dateFilter" className="form-label">
                <i className="bi bi-calendar3 me-1"></i>
                Select Date
              </label>
              <input
                type="date"
                id="dateFilter"
                className="form-control"
                value={selectedDate}
                onChange={handleDateChange}
                max={new Date().toISOString().split("T")[0]}
              />
            </div>
          </div>
        </div>
        <div className="col-md-8">
          <div className="card bg-light">
            <div className="card-body">
              <h6 className="card-title mb-1">
                <i className="bi bi-info-circle me-1"></i>
                Data Summary for {formatDate(selectedDate)}
              </h6>
              <small className="text-muted">
                Showing attendance data for the selected date.
                {stats.recentAttendance.length > 0
                  ? ` Found ${stats.recentAttendance.length} attendance records for ${derivedStats.activeEmployees} employees.`
                  : " No attendance records found for this date."}
              </small>
            </div>
          </div>
        </div>
      </div>
      {/* Stats Cards - Fixed */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h4 className="mb-0">{derivedStats.activeEmployees}</h4>
                  <p className="mb-0">Active Employees</p>
                  <small>({stats.totalEmployees} total)</small>
                </div>
                <div className="align-self-center">
                  <i className="bi bi-people fs-1"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card bg-success text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h4 className="mb-0">{derivedStats.checkInCount}</h4>
                  <p className="mb-0">Check-ins Today</p>
                  <small>({stats.todayPresent} present)</small>
                </div>
                <div className="align-self-center">
                  <i className="bi bi-check-circle fs-1"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card bg-info text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h4 className="mb-0">{derivedStats.checkOutCount}</h4>
                  <p className="mb-0">Check-outs Today</p>
                  <small>(Completed work)</small>
                </div>
                <div className="align-self-center">
                  <i className="bi bi-check2-circle fs-1"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card bg-warning text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h4 className="mb-0">{derivedStats.totalRecords}</h4>
                  <p className="mb-0">Total Records</p>
                  <small>({formatDate(selectedDate)})</small>
                </div>
                <div className="align-self-center">
                  <i className="bi bi-file-earmark-text fs-1"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
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
                <div className="col-md-4 mb-2">
                  <Link
                    to="/admin/employees"
                    className="btn btn-outline-primary w-100"
                  >
                    <i className="bi bi-person-plus me-1"></i>
                    Manage Employees
                  </Link>
                </div>
                <div className="col-md-4 mb-2">
                  <Link
                    to="/admin/attendance"
                    className="btn btn-outline-success w-100"
                  >
                    <i className="bi bi-calendar-check me-1"></i>
                    View All Attendance
                  </Link>
                </div>
                <div className="col-md-4 mb-2">
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
              {stats.recentAttendance.length === 0 ? (
                <div className="text-center py-4">
                  <i className="bi bi-inbox fs-1 text-muted"></i>
                  <p className="text-muted mt-2">
                    No attendance records found for {formatDate(selectedDate)}
                  </p>
                  <small className="text-muted">
                    Try selecting a different date or check if employees have
                    logged their attendance.
                  </small>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Employee</th>
                        <th>Status</th>
                        <th>Check In</th>
                        <th>Check Out</th>
                        <th>Duration</th>
                        <th>Location</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const employees = Object.values(
                          derivedStats.groupedEmployees
                        );

                        return employees.map((employee, index) => {
                          const checkInRecord = employee.records.find(
                            (r) => r.status === "check-in"
                          );
                          const checkOutRecord = employee.records.find(
                            (r) => r.status === "check-out"
                          );
                          const employeeStatus = getEmployeeStatus(
                            employee.records
                          );

                          return (
                            <tr key={employee.employeeId}>
                              <td>
                                <div className="d-flex align-items-center">
                                  <div className="avatar-circle me-2">
                                    {employee.employeeName
                                      .charAt(0)
                                      .toUpperCase()}
                                  </div>
                                  <div>
                                    <strong>{employee.employeeName}</strong>
                                    <br />

                                    <small className="text-muted">
                                      {employee.employeeEmail}
                                    </small>
                                    <br />

                                    <small className="text-muted">
                                      ID: {employee.employeeId.substring(0, 8)}
                                      ...
                                    </small>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <span
                                  className={`badge ${getStatusBadgeClass(
                                    employeeStatus
                                  )}`}
                                >
                                  {employeeStatus.charAt(0).toUpperCase() +
                                    employeeStatus.slice(1)}
                                </span>
                                <br />

                                <small className="text-muted">
                                  {employee.records.length} records
                                </small>
                              </td>
                              <td>
                                {checkInRecord ? (
                                  <span className="text-success">
                                    <i className="bi bi-box-arrow-in-right me-1"></i>
                                    {formatTime(checkInRecord.timestamp)}
                                  </span>
                                ) : (
                                  <span className="text-muted">
                                    <i className="bi bi-dash me-1"></i>
                                    Not checked in
                                  </span>
                                )}
                              </td>
                              <td>
                                {checkOutRecord ? (
                                  <span className="text-primary">
                                    <i className="bi bi-box-arrow-right me-1"></i>
                                    {formatTime(checkOutRecord.timestamp)}
                                  </span>
                                ) : (
                                  <span className="text-muted">
                                    <i className="bi bi-dash me-1"></i>

                                    {checkInRecord
                                      ? "Still working"
                                      : "Not checked out"}
                                  </span>
                                )}
                              </td>
                              <td>
                                <span className="badge bg-light text-dark">
                                  {checkInRecord && checkOutRecord
                                    ? calculateDuration(
                                        checkInRecord.timestamp,
                                        checkOutRecord.timestamp
                                      )
                                    : checkInRecord
                                    ? "In Progress"
                                    : "N/A"}
                                </span>
                              </td>
                              <td>
                                <span className="badge bg-light text-dark">
                                  <i className="bi bi-geo-alt me-1"></i>
                                  Remote
                                </span>
                              </td>
                              <td>
                                <div className="btn-group" role="group">
                                  <button
                                    className="btn btn-sm btn-outline-info"
                                    onClick={() =>
                                      showEmployeeDetails(employee)
                                    }
                                    title="View Details"
                                  >
                                    <i className="bi bi-eye"></i>
                                  </button>
                                  <button
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() =>
                                      viewEmployeeAttendance(
                                        employee.employeeId
                                      )
                                    }
                                    title="View Full Attendance"
                                  >
                                    <i className="bi bi-calendar-check"></i>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Debug Information - Remove in production */}
      {process.env.NODE_ENV === "development" && (
        <div className="row mt-4">
          <div className="col-12">
            <div className="card border-warning">
              <div className="card-header bg-warning text-dark">
                <h6 className="mb-0">
                  <i className="bi bi-bug me-1"></i>
                  Debug Information (Development Only)
                </h6>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-4">
                    <h6>User Info:</h6>

                    <pre className="bg-light p-2 rounded small">
                      {JSON.stringify(
                        {
                          name: user?.name,
                          email: user?.email,
                          role: user?.role,
                          id: user?.id,
                        },
                        null,
                        2
                      )}
                    </pre>
                  </div>
                  <div className="col-md-4">
                    <h6>Stats Info:</h6>

                    <pre className="bg-light p-2 rounded small">
                      {JSON.stringify(
                        {
                          totalEmployees: stats.totalEmployees,
                          todayPresent: stats.todayPresent,
                          todayAbsent: stats.todayAbsent,
                          recordsCount: stats.recentAttendance.length,
                          selectedDate: selectedDate,
                          derivedStats: {
                            activeEmployees: derivedStats.activeEmployees,
                            checkInCount: derivedStats.checkInCount,
                            checkOutCount: derivedStats.checkOutCount,
                            totalRecords: derivedStats.totalRecords,
                          },
                        },
                        null,
                        2
                      )}
                    </pre>
                  </div>
                  <div className="col-md-4">
                    <h6>Sample Records:</h6>
                    <pre className="bg-light p-2 rounded small">
                      {JSON.stringify(
                        stats.recentAttendance.slice(0, 2),
                        null,
                        2
                      )}
                    </pre>
                  </div>
                </div>
                {Object.keys(derivedStats.groupedEmployees).length > 0 && (
                  <div className="mt-3">
                    <h6>Grouped Employees:</h6>
                    <pre className="bg-light p-2 rounded small">
                      {JSON.stringify(
                        Object.fromEntries(
                          Object.entries(derivedStats.groupedEmployees).slice(
                            0,
                            1
                          )
                        ),
                        null,
                        2
                      )}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .avatar-circle {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #007bff, #0056b3);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 16px;
        }

        .table th {
          border-top: none;
          font-weight: 600;
          color: #495057;
          background-color: #f8f9fa;
        }

        .card {
          box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
          border: 1px solid rgba(0, 0, 0, 0.125);
          transition: box-shadow 0.15s ease-in-out;
        }

        .card:hover {
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
        }

        .badge {
          font-size: 0.75em;
        }

        .btn-outline-secondary:hover,
        .btn-outline-primary:hover,
        .btn-outline-success:hover,
        .btn-outline-info:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .table-responsive {
          border-radius: 0.375rem;
        }

        .btn-group .btn {
          border-radius: 0.25rem;
        }

        .btn-group .btn:not(:last-child) {
          margin-right: 0.25rem;
        }

        pre {
          font-size: 0.75rem;
          max-height: 200px;
          overflow-y: auto;
        }

        .text-muted {
          color: #6c757d !important;
        }

        .bg-light {
          background-color: #f8f9fa !important;
        }
      `}</style>
    </div>
  );
};

export default AdminDashboardPage;

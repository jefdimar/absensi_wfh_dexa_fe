import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { adminService } from "../../services/adminService";
import toast from "react-hot-toast";

const AdminAttendancePage = () => {
  const { logout } = useAuth();
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState({
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    employeeId: "",
    status: "",
  });
  const [employees, setEmployees] = useState([]);
  const [stats, setStats] = useState({
    totalRecords: 0,
    presentCount: 0,
    absentCount: 0,
    incompleteCount: 0,
  });

  useEffect(() => {
    fetchAttendanceData();
    fetchEmployees();
  }, [currentPage, filters]);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      console.log("AdminAttendance: Fetching data with filters:", filters);

      // Get attendance records with filters
      const attendanceResponse = await adminService.getAllAttendance(
        currentPage,
        10,
        {
          startDate: filters.startDate,
          endDate: filters.endDate,
          employeeId: filters.employeeId || undefined,
          status: filters.status || undefined,
        }
      );

      console.log("AdminAttendance: Attendance response:", attendanceResponse);

      setAttendanceRecords(
        attendanceResponse.attendance || attendanceResponse.data || []
      );
      setTotalPages(
        attendanceResponse.totalPages ||
          Math.ceil((attendanceResponse.totalCount || 0) / 10)
      );
      setTotalCount(
        attendanceResponse.totalCount || attendanceResponse.total || 0
      );

      // Get attendance statistics
      const statsResponse = await adminService.getAttendanceStats(
        filters.startDate,
        filters.endDate
      );

      console.log("AdminAttendance: Stats response:", statsResponse);

      setStats({
        totalRecords:
          statsResponse.totalRecords || attendanceResponse.totalCount || 0,
        presentCount: statsResponse.presentCount || 0,
        absentCount: statsResponse.absentCount || 0,
        incompleteCount: statsResponse.incompleteCount || 0,
      });
    } catch (error) {
      console.error("AdminAttendance: Error fetching attendance data:", error);
      toast.error("Failed to load attendance data");
      setAttendanceRecords([]);
      setStats({
        totalRecords: 0,
        presentCount: 0,
        absentCount: 0,
        incompleteCount: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      console.log("AdminAttendance: Fetching employees for filter...");
      const response = await adminService.getAllEmployees(1, 1000); // Get all employees for filter
      console.log("AdminAttendance: Employees response:", response);
      setEmployees(response.employees || response.data || []);
    } catch (error) {
      console.error("AdminAttendance: Error fetching employees:", error);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
    setCurrentPage(1); // Reset to first page when filtering
  };

  const clearFilters = () => {
    setFilters({
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date().toISOString().split("T")[0],
      employeeId: "",
      status: "",
    });
    setCurrentPage(1);
  };

  const exportToCSV = () => {
    if (attendanceRecords.length === 0) {
      toast.error("No data to export");
      return;
    }

    const headers = [
      "Date",
      "Employee Name",
      "Email",
      "Status",
      "Check In",
      "Check Out",
      "Total Hours",
      "Location",
      "Notes",
    ];

    const csvContent = [
      headers.join(","),
      ...attendanceRecords.map((record) =>
        [
          formatDate(record.date || record.createdAt),
          `"${record.employeeName || record.employee?.name || "N/A"}"`,
          `"${record.employeeEmail || record.employee?.email || "N/A"}"`,
          record.status || "N/A",

          formatTime(record.checkInTime || record.checkIn) || "N/A",
          formatTime(record.checkOutTime || record.checkOut) || "N/A",
          record.totalHours || record.duration || "N/A",
          `"${record.location || "N/A"}"`,
          `"${record.notes || "N/A"}"`,
        ].join(",")
      ),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance_report_${filters.startDate}_to_${filters.endDate}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    toast.success("Report exported successfully");
  };

  const formatTime = (timeString) => {
    if (!timeString) return "N/A";

    try {
      return new Date(timeString).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "N/A";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      return "N/A";
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      present: "bg-success",
      absent: "bg-danger",
      incomplete: "bg-warning text-dark",
      "check-in": "bg-info",
      "check-out": "bg-primary",
    };

    return (
      <span className={`badge ${statusClasses[status] || "bg-secondary"}`}>
        {status || "Unknown"}
      </span>
    );
  };

  const calculateWorkingHours = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return "N/A";
    try {
      const start = new Date(checkIn);
      const end = new Date(checkOut);
      const diffMs = end - start;
      const diffHours = diffMs / (1000 * 60 * 60);
      return diffHours > 0 ? `${diffHours.toFixed(1)}h` : "N/A";
    } catch (error) {
      return "N/A";
    }
  };

  return (
    <div className="container mt-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="mb-1">
                <i className="bi bi-calendar-check me-2"></i>
                Attendance Management
              </h1>
              <p className="text-muted mb-0">
                View and manage all employee attendance records ({totalCount}{" "}
                total)
              </p>
            </div>
            <div className="d-flex gap-2">
              <button
                className="btn btn-outline-secondary"
                onClick={() => (window.location.href = "/admin")}
              >
                <i className="bi bi-arrow-left me-1"></i>
                Back to Dashboard
              </button>
              <button className="btn btn-outline-danger" onClick={logout}>
                <i className="bi bi-box-arrow-right me-1"></i>
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h4 className="mb-0">{stats.totalRecords}</h4>
                  <p className="mb-0">Total Records</p>
                </div>
                <div className="align-self-center">
                  <i className="bi bi-file-earmark-text fs-1"></i>
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
                  <h4 className="mb-0">{stats.presentCount}</h4>
                  <p className="mb-0">Present</p>
                </div>
                <div className="align-self-center">
                  <i className="bi bi-check-circle fs-1"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card bg-danger text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h4 className="mb-0">{stats.absentCount}</h4>
                  <p className="mb-0">Absent</p>
                </div>
                <div className="align-self-center">
                  <i className="bi bi-x-circle fs-1"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card bg-warning text-dark">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h4 className="mb-0">{stats.incompleteCount}</h4>
                  <p className="mb-0">Incomplete</p>
                </div>
                <div className="align-self-center">
                  <i className="bi bi-exclamation-triangle fs-1"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-funnel me-1"></i>
                Filters
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-3">
                  <label htmlFor="startDate" className="form-label">
                    Start Date
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    id="startDate"
                    name="startDate"
                    value={filters.startDate}
                    onChange={handleFilterChange}
                  />
                </div>
                <div className="col-md-3">
                  <label htmlFor="endDate" className="form-label">
                    End Date
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    id="endDate"
                    name="endDate"
                    value={filters.endDate}
                    onChange={handleFilterChange}
                  />
                </div>
                <div className="col-md-3">
                  <label htmlFor="employeeId" className="form-label">
                    Employee
                  </label>
                  <select
                    className="form-control"
                    id="employeeId"
                    name="employeeId"
                    value={filters.employeeId}
                    onChange={handleFilterChange}
                  >
                    <option value="">All Employees</option>
                    {employees.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.name} ({employee.email})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-3">
                  <label htmlFor="status" className="form-label">
                    Status
                  </label>
                  <select
                    className="form-control"
                    id="status"
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                  >
                    <option value="">All Status</option>
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                    <option value="incomplete">Incomplete</option>
                    <option value="check-in">Check In</option>
                    <option value="check-out">Check Out</option>
                  </select>
                </div>
              </div>
              <div className="row mt-3">
                <div className="col-12">
                  <button
                    className="btn btn-secondary me-2"
                    onClick={clearFilters}
                  >
                    <i className="bi bi-x-circle me-1"></i>
                    Clear Filters
                  </button>
                  <button
                    className="btn btn-success me-2"
                    onClick={exportToCSV}
                    disabled={attendanceRecords.length === 0}
                  >
                    <i className="bi bi-download me-1"></i>
                    Export CSV
                  </button>
                  <button
                    className="btn btn-outline-primary"
                    onClick={fetchAttendanceData}
                    disabled={loading}
                  >
                    <i className="bi bi-arrow-clockwise me-1"></i>
                    {loading ? "Loading..." : "Refresh"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Records Table */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="bi bi-list me-1"></i>
                Attendance Records
                {(filters.startDate || filters.endDate) && (
                  <small className="text-muted ms-2">
                    ({formatDate(filters.startDate)} to{" "}
                    {formatDate(filters.endDate)})
                  </small>
                )}
              </h5>
              <div className="d-flex gap-2">
                {totalCount > 0 && (
                  <small className="text-muted align-self-center">
                    Showing {(currentPage - 1) * 10 + 1} to{" "}
                    {Math.min(currentPage * 10, totalCount)} of {totalCount}
                  </small>
                )}
              </div>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : attendanceRecords.length === 0 ? (
                <div className="text-center py-4">
                  <i className="bi bi-inbox fs-1 text-muted"></i>
                  <p className="text-muted mt-2">No attendance records found</p>
                  {(filters.startDate !==
                    new Date().toISOString().split("T")[0] ||
                    filters.endDate !==
                      new Date().toISOString().split("T")[0] ||
                    filters.employeeId ||
                    filters.status) && (
                    <button
                      className="btn btn-outline-primary"
                      onClick={clearFilters}
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Employee</th>
                          <th>Status</th>
                          <th>Check In</th>
                          <th>Check Out</th>
                          <th>Working Hours</th>
                          <th>Location</th>
                          <th>Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attendanceRecords.map((record, index) => (
                          <tr key={record.id || index}>
                            <td>
                              {formatDate(record.date || record.createdAt)}
                            </td>
                            <td>
                              <div>
                                <strong>
                                  {record.employeeName ||
                                    record.employee?.name ||
                                    "Unknown"}
                                </strong>
                                <br />
                                <small className="text-muted">
                                  {record.employeeEmail ||
                                    record.employee?.email ||
                                    "N/A"}
                                </small>
                              </div>
                            </td>
                            <td>{getStatusBadge(record.status)}</td>

                            <td>
                              {record.checkInTime || record.checkIn ? (
                                <div>
                                  <strong>
                                    {formatTime(
                                      record.checkInTime || record.checkIn
                                    )}
                                  </strong>
                                  <br />
                                  <small className="text-muted">
                                    {formatDate(
                                      record.checkInTime || record.checkIn
                                    )}
                                  </small>
                                </div>
                              ) : (
                                <span className="text-muted">N/A</span>
                              )}
                            </td>
                            <td>
                              {record.checkOutTime || record.checkOut ? (
                                <div>
                                  <strong>
                                    {formatTime(
                                      record.checkOutTime || record.checkOut
                                    )}
                                  </strong>
                                  <br />
                                  <small className="text-muted">
                                    {formatDate(
                                      record.checkOutTime || record.checkOut
                                    )}
                                  </small>
                                </div>
                              ) : (
                                <span className="text-muted">N/A</span>
                              )}
                            </td>
                            <td>
                              <span
                                className={`badge ${
                                  record.totalHours || record.duration
                                    ? "bg-info"
                                    : "bg-secondary"
                                }`}
                              >
                                {record.totalHours ||
                                  record.duration ||
                                  calculateWorkingHours(
                                    record.checkInTime || record.checkIn,
                                    record.checkOutTime || record.checkOut
                                  )}
                              </span>
                            </td>
                            <td>
                              <span className="badge bg-light text-dark">
                                {record.location || "N/A"}
                              </span>
                            </td>
                            <td>
                              {record.notes ? (
                                <span
                                  title={record.notes}
                                  className="text-truncate d-inline-block"
                                  style={{ maxWidth: "150px" }}
                                >
                                  {record.notes}
                                </span>
                              ) : (
                                <span className="text-muted">N/A</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <nav className="mt-3">
                      <ul className="pagination justify-content-center">
                        <li
                          className={`page-item ${
                            currentPage === 1 ? "disabled" : ""
                          }`}
                        >
                          <button
                            className="page-link"
                            onClick={() => setCurrentPage(currentPage - 1)}
                            disabled={currentPage === 1}
                          >
                            <i className="bi bi-chevron-left"></i>
                            Previous
                          </button>
                        </li>

                        {/* Page numbers */}
                        {[...Array(Math.min(5, totalPages))].map((_, index) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = index + 1;
                          } else if (currentPage <= 3) {
                            pageNum = index + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + index;
                          } else {
                            pageNum = currentPage - 2 + index;
                          }

                          return (
                            <li
                              key={pageNum}
                              className={`page-item ${
                                currentPage === pageNum ? "active" : ""
                              }`}
                            >
                              <button
                                className="page-link"
                                onClick={() => setCurrentPage(pageNum)}
                              >
                                {pageNum}
                              </button>
                            </li>
                          );
                        })}

                        <li
                          className={`page-item ${
                            currentPage === totalPages ? "disabled" : ""
                          }`}
                        >
                          <button
                            className="page-link"
                            onClick={() => setCurrentPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                          >
                            Next
                            <i className="bi bi-chevron-right"></i>
                          </button>
                        </li>
                      </ul>

                      <div className="text-center mt-2">
                        <small className="text-muted">
                          Page {currentPage} of {totalPages} ({totalCount} total
                          records)
                        </small>
                      </div>
                    </nav>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAttendancePage;

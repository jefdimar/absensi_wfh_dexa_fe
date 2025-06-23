import React from "react";
import { formatTime } from "../../utils/formatters";
import {
  getEmployeeStatus,
  getStatusBadgeClass,
  calculateDuration,
} from "../../utils/adminHelpers";

const AttendanceTable = ({
  groupedEmployees,
  onShowEmployeeDetails,
  onViewEmployeeAttendance,
}) => {
  const employees = Object.values(groupedEmployees);

  if (employees.length === 0) {
    return (
      <div className="text-center py-4">
        <i className="bi bi-inbox fs-1 text-muted"></i>
        <p className="text-muted mt-2">
          No attendance records found for the selected date
        </p>
        <small className="text-muted">
          Try selecting a different date or check if employees have logged their
          attendance.
        </small>
      </div>
    );
  }

  return (
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
          {employees.map((employee) => {
            const checkInRecord = employee.records.find(
              (r) => r.status === "check-in"
            );
            const checkOutRecord = employee.records.find(
              (r) => r.status === "check-out"
            );
            const employeeStatus = getEmployeeStatus(employee.records);

            return (
              <tr key={employee.employeeId}>
                <td>
                  <div className="d-flex align-items-center">
                    <div className="avatar-circle me-2">
                      {employee.employeeName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <strong>{employee.employeeName}</strong>
                      <br />
                      <small className="text-muted">
                        {employee.employeeEmail}
                      </small>
                      <br />
                      <small className="text-muted">
                        ID: {employee.employeeId.substring(0, 8)}...
                      </small>
                    </div>
                  </div>
                </td>
                <td>
                  <span
                    className={`badge ${getStatusBadgeClass(employeeStatus)}`}
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
                      {checkInRecord ? "Still working" : "Not checked out"}
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
                      onClick={() => onShowEmployeeDetails(employee)}
                      title="View Details"
                    >
                      <i className="bi bi-eye"></i>
                    </button>
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() =>
                        onViewEmployeeAttendance(employee.employeeId)
                      }
                      title="View Full Attendance"
                    >
                      <i className="bi bi-calendar-check"></i>
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default AttendanceTable;

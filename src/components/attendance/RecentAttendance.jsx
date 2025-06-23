import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useAttendance } from "../../contexts/AttendanceContext";

const RecentAttendance = () => {
  const { attendanceRecords, fetchAttendanceRecords, isLoading } =
    useAttendance();

  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    if (!hasInitialized && !isLoading) {
      fetchAttendanceRecords();
      setHasInitialized(true);
    }
  }, [hasInitialized, isLoading, fetchAttendanceRecords]);

  const handleRefresh = useCallback(() => {
    fetchAttendanceRecords(true);
  }, [fetchAttendanceRecords]);

  const filteredRecords = useMemo(() => {
    if (!attendanceRecords || !Array.isArray(attendanceRecords)) {
      return [];
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentRecords = attendanceRecords.filter((record) => {
      const recordDate = new Date(record.timestamp);
      return recordDate >= sevenDaysAgo;
    });

    const groupedByDate = {};

    recentRecords.forEach((record) => {
      const dateKey = new Date(record.timestamp).toDateString();

      if (!groupedByDate[dateKey]) {
        groupedByDate[dateKey] = {
          date: dateKey,
          checkIn: null,
          checkOut: null,
          records: [],
        };
      }

      groupedByDate[dateKey].records.push(record);

      if (record.status === "check-in") {
        groupedByDate[dateKey].checkIn = record;
      } else if (record.status === "check-out") {
        groupedByDate[dateKey].checkOut = record;
      }
    });

    return Object.values(groupedByDate).sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
  }, [attendanceRecords]);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return "Unknown";

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      return "Invalid Date";
    }
  }, []);

  const formatTime = useCallback((timestamp) => {
    if (!timestamp) return "--:--";

    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch (error) {
      return "--:--";
    }
  }, []);

  const calculateWorkingHours = useCallback((checkInRecord, checkOutRecord) => {
    if (!checkInRecord || !checkOutRecord) return "--:--";

    try {
      const checkIn = new Date(checkInRecord.timestamp);
      const checkOut = new Date(checkOutRecord.timestamp);
      const diffMs = checkOut - checkIn;

      if (diffMs <= 0) return "--:--";

      const diffHours = diffMs / (1000 * 60 * 60);
      const hours = Math.floor(diffHours);
      const minutes = Math.round((diffHours - hours) * 60);

      return `${hours}:${minutes.toString().padStart(2, "0")}`;
    } catch (error) {
      return "--:--";
    }
  }, []);

  const getStatusBadge = useCallback((dayRecord) => {
    if (dayRecord.checkOut && dayRecord.checkIn) {
      return (
        <span className="badge bg-success">
          <i className="bi bi-check-circle me-1"></i>
          Completed
        </span>
      );
    } else if (dayRecord.checkIn && !dayRecord.checkOut) {
      return (
        <span className="badge bg-warning">
          <i className="bi bi-clock me-1"></i>
          In Progress
        </span>
      );
    } else if (dayRecord.checkOut && !dayRecord.checkIn) {
      return (
        <span className="badge bg-danger">
          <i className="bi bi-exclamation-triangle me-1"></i>
          Missing Check-in
        </span>
      );
    } else {
      return (
        <span className="badge bg-secondary">
          <i className="bi bi-dash-circle me-1"></i>
          No Record
        </span>
      );
    }
  }, []);

  const summaryStats = useMemo(() => {
    return {
      completed: filteredRecords.filter((day) => day.checkIn && day.checkOut)
        .length,
      inProgress: filteredRecords.filter((day) => day.checkIn && !day.checkOut)
        .length,
      missing: filteredRecords.filter((day) => day.checkOut && !day.checkIn)
        .length,
      total: filteredRecords.length,
    };
  }, [filteredRecords]);

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-info text-white">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h5 className="card-title mb-0">
              <i className="bi bi-clock-history me-2"></i>
              Recent Attendance
            </h5>
            <small className="opacity-75 d-block mt-1">Last 7 days</small>
          </div>
          <button
            className="btn btn-outline-light btn-sm"
            onClick={handleRefresh}
            disabled={isLoading}
            title="Refresh recent attendance"
          >
            <i
              className={`bi bi-arrow-clockwise ${isLoading ? "spin" : ""}`}
            ></i>
          </button>
        </div>
      </div>

      <div className="card-body">
        {isLoading ? (
          <div className="text-center py-4">
            <div
              className="spinner-border spinner-border-sm text-info"
              role="status"
            >
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2 text-muted small">
              Loading recent attendance...
            </p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="text-center py-5">
            <i
              className="bi bi-calendar-x text-muted"
              style={{ fontSize: "3rem" }}
            ></i>
            <h6 className="text-muted mt-3">No recent attendance records</h6>
            <p className="text-muted small mb-3">
              No attendance records found for the last 7 days.
            </p>
            <button
              type="button"
              className="btn btn-outline-info btn-sm"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <i className="bi bi-arrow-clockwise me-1"></i>
              Refresh
            </button>
          </div>
        ) : (
          <>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <small className="text-muted">
                Showing {Math.min(filteredRecords.length, 5)} of{" "}
                {filteredRecords.length} recent days
              </small>
              <small className="text-muted">
                Last 7 days • {attendanceRecords?.length || 0} total records
              </small>
            </div>

            <div className="table-responsive">
              <table className="table table-sm table-hover">
                <thead className="table-light">
                  <tr>
                    <th scope="col">
                      <i className="bi bi-calendar3 me-1"></i>
                      Date
                    </th>
                    <th scope="col">
                      <i className="bi bi-box-arrow-in-right me-1"></i>
                      Check In
                    </th>
                    <th scope="col">
                      <i className="bi bi-box-arrow-right me-1"></i>
                      Check Out
                    </th>
                    <th scope="col">
                      <i className="bi bi-clock me-1"></i>
                      Hours
                    </th>
                    <th scope="col">
                      <i className="bi bi-info-circle me-1"></i>
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.slice(0, 5).map((dayRecord, index) => {
                    const workingHours = calculateWorkingHours(
                      dayRecord.checkIn,
                      dayRecord.checkOut
                    );

                    return (
                      <tr key={`day-${dayRecord.date}-${index}`}>
                        <td className="fw-semibold">
                          {formatDate(dayRecord.date)}
                        </td>
                        <td>
                          <span
                            className={
                              dayRecord.checkIn
                                ? "text-success fw-semibold"
                                : "text-muted"
                            }
                          >
                            {dayRecord.checkIn
                              ? formatTime(dayRecord.checkIn.timestamp)
                              : "--:--"}
                          </span>
                        </td>
                        <td>
                          <span
                            className={
                              dayRecord.checkOut
                                ? "text-danger fw-semibold"
                                : "text-muted"
                            }
                          >
                            {dayRecord.checkOut
                              ? formatTime(dayRecord.checkOut.timestamp)
                              : "--:--"}
                          </span>
                        </td>
                        <td>
                          <span
                            className={
                              workingHours !== "--:--"
                                ? "fw-semibold text-primary"
                                : "text-muted"
                            }
                          >
                            {workingHours}
                          </span>
                        </td>
                        <td>{getStatusBadge(dayRecord)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-3 p-3 bg-light rounded">
              <div className="row text-center">
                <div className="col-3">
                  <div className="text-success fw-bold">
                    {summaryStats.completed}
                  </div>
                  <small className="text-muted">Completed</small>
                </div>
                <div className="col-3">
                  <div className="text-warning fw-bold">
                    {summaryStats.inProgress}
                  </div>
                  <small className="text-muted">In Progress</small>
                </div>
                <div className="col-3">
                  <div className="text-danger fw-bold">
                    {summaryStats.missing}
                  </div>
                  <small className="text-muted">Missing</small>
                </div>
                <div className="col-3">
                  <div className="text-info fw-bold">{summaryStats.total}</div>
                  <small className="text-muted">Total Days</small>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RecentAttendance;

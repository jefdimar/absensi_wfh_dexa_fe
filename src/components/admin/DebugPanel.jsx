import React from "react";

const DebugPanel = ({ user, stats, selectedDate, derivedStats }) => {
  // Only show in development
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
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
                  {JSON.stringify(stats.recentAttendance.slice(0, 2), null, 2)}
                </pre>
              </div>
            </div>
            {Object.keys(derivedStats.groupedEmployees).length > 0 && (
              <div className="mt-3">
                <h6>Grouped Employees:</h6>
                <pre className="bg-light p-2 rounded small">
                  {JSON.stringify(
                    Object.fromEntries(
                      Object.entries(derivedStats.groupedEmployees).slice(0, 1)
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
  );
};

export default DebugPanel;

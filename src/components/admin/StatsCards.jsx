import React from "react";

const StatsCards = ({ derivedStats, stats, selectedDate, formatDate }) => {
  return (
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
  );
};

export default StatsCards;

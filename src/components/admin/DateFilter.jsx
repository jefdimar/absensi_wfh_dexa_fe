import React from "react";
import {
  formatDate,
  getCurrentDate,
  isFutureDate,
} from "../../utils/formatters";
import toast from "react-hot-toast";

const DateFilter = ({ selectedDate, onDateChange, stats }) => {
  const handleDateChange = (e) => {
    const newDate = e.target.value;

    if (isFutureDate(newDate)) {
      toast.error("Cannot select future dates");
      return;
    }

    onDateChange(newDate);
    toast.info(`Loading data for ${formatDate(newDate)}...`);
  };

  return (
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
              max={getCurrentDate()}
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
                ? ` Found ${stats.recentAttendance.length} attendance records.`
                : " No attendance records found for this date."}
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DateFilter;

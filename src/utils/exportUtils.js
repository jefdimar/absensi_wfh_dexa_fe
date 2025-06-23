import { formatTime, formatDate } from './formatters';
import { getDerivedStats, getEmployeeStatus, calculateDuration } from './adminHelpers';
import toast from 'react-hot-toast';

/**
 * Export attendance data to CSV
 */
export const exportAttendanceData = (recentAttendance, selectedDate) => {
  if (!recentAttendance || recentAttendance.length === 0) {
    toast.error("No data to export");
    return;
  }

  const derivedStats = getDerivedStats(recentAttendance);
  const groupedEmployees = Object.values(derivedStats.groupedEmployees);
  const csvData = [];

  // CSV Headers
  csvData.push([
    "Employee ID",
    "Employee Name",
    "Employee Email",
    "Date",
    "Check In Time",
    "Check Out Time",
    "Duration",
    "Status",
    "Total Records"
  ]);

  // CSV Data
  groupedEmployees.forEach(employee => {
    const checkInRecord = employee.records.find(r => r.status === 'check-in');
    const checkOutRecord = employee.records.find(r => r.status === 'check-out');
    const status = getEmployeeStatus(employee.records);
    const duration = checkInRecord && checkOutRecord
      ? calculateDuration(checkInRecord.timestamp, checkOutRecord.timestamp)
      : checkInRecord ? "In Progress" : "N/A";

    csvData.push([
      employee.employeeId,
      employee.employeeName,
      employee.employeeEmail,
      selectedDate,
      checkInRecord ? formatTime(checkInRecord.timestamp) : "N/A",
      checkOutRecord ? formatTime(checkOutRecord.timestamp) : "N/A",
      duration,
      status,
      employee.records.length
    ]);
  });

  // Create CSV content
  const csvContent = csvData.map(row =>
    row.map(field => `"${field}"`).join(",")
  ).join("\n");

  // Download CSV
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `attendance_report_${selectedDate}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);

  toast.success("Attendance data exported successfully!");
};

/**
 * Export attendance data to JSON
 */
export const exportAttendanceJSON = (recentAttendance, selectedDate) => {
  if (!recentAttendance || recentAttendance.length === 0) {
    toast.error("No data to export");
    return;
  }

  const derivedStats = getDerivedStats(recentAttendance);
  const exportData = {
    date: selectedDate,
    exportedAt: new Date().toISOString(),
    summary: {
      totalEmployees: derivedStats.activeEmployees,
      totalRecords: derivedStats.totalRecords,
      checkIns: derivedStats.checkInCount,
      checkOuts: derivedStats.checkOutCount
    },
    employees: Object.values(derivedStats.groupedEmployees),
    rawRecords: recentAttendance
  };

  const jsonContent = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonContent], { type: "application/json" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `attendance_data_${selectedDate}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);

  toast.success("Attendance data exported as JSON!");
};
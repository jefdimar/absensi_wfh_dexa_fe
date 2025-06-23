import { formatTime } from './formatters';
import toast from 'react-hot-toast';

/**
 * Show employee details in a modal or alert
 */
export const showEmployeeDetails = (employee) => {
  const details = `
Employee: ${employee.employeeName}
ID: ${employee.employeeId}
Email: ${employee.employeeEmail}
Records Today: ${employee.records.length}

Records:
${employee.records.map(r => `• ${r.status} at ${formatTime(r.timestamp)}`).join('\n')}
  `;

  // For now using alert, but you can replace with a proper modal
  alert(details);
};

/**
 * Navigate to employee attendance view
 */
export const viewEmployeeAttendance = (employeeId, navigate = null) => {
  toast.info(`Viewing attendance for employee: ${employeeId.substring(0, 8)}...`);

  // If navigate function is provided, use it
  if (navigate) {
    navigate(`/admin/attendance?employeeId=${employeeId}`);
  } else {
    // Fallback to window location
    window.location.href = `/admin/attendance?employeeId=${employeeId}`;
  }
};

/**
 * Send notification to employee
 */
export const sendEmployeeNotification = async (employeeId, message) => {
  try {
    // This would integrate with your notification service
    toast.info(`Notification sent to employee: ${employeeId.substring(0, 8)}`);
    // Implement actual notification sending logic here
  } catch (error) {
    toast.error("Failed to send notification");
  }
};

/**
 * Generate employee report
 */
export const generateEmployeeReport = (employee, selectedDate) => {
  toast.info(`Generating report for ${employee.employeeName}...`);
  // Implement report generation logic here
};
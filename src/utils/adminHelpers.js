/**
 * Helper functions for admin dashboard operations
 */

export const calculateDuration = (checkIn, checkOut) => {
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

export const calculateDurationFromRecords = (currentRecord, allRecords) => {
  if (!currentRecord.employeeId) return "N/A";

  // Find all records for this employee
  const employeeRecords = allRecords.filter(r => r.employeeId === currentRecord.employeeId);

  // Sort by timestamp
  employeeRecords.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  // Find check-in and check-out pairs
  let checkIn = null;
  let checkOut = null;

  for (const record of employeeRecords) {
    if (record.status === 'check-in') {
      checkIn = record;
    } else if (record.status === 'check-out' && checkIn) {
      checkOut = record;
      break;
    }
  }

  if (checkIn && checkOut) {
    return calculateDuration(checkIn.timestamp, checkOut.timestamp);
  } else if (checkIn && currentRecord.status === 'check-in') {
    return "In Progress";
  }

  return "N/A";
};

export const groupRecordsByEmployee = (records) => {
  const grouped = {};

  records.forEach(record => {
    if (!grouped[record.employeeId]) {
      grouped[record.employeeId] = {
        employeeId: record.employeeId,
        employeeName: record.employeeName || `Employee ${record.employeeId.substring(0, 8)}`,
        employeeEmail: record.employeeEmail || "N/A",
        records: []
      };
    }
    grouped[record.employeeId].records.push(record);
  });

  // Sort records by timestamp for each employee
  Object.values(grouped).forEach(employee => {
    employee.records.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  });

  return grouped;
};

export const getEmployeeStatus = (employeeRecords) => {
  if (!employeeRecords || employeeRecords.length === 0) return "absent";

  // Sort by timestamp
  const sorted = [...employeeRecords].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  const latestRecord = sorted[0];

  if (latestRecord.status === 'check-in') {
    return "present";
  } else if (latestRecord.status === 'check-out') {
    return "completed";
  }

  return "unknown";
};

export const getStatusBadgeClass = (status) => {
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

export const getDerivedStats = (recentAttendance) => {
  const groupedEmployees = groupRecordsByEmployee(recentAttendance);
  const activeEmployees = Object.keys(groupedEmployees).length;
  const checkInCount = recentAttendance.filter(r => r.status === 'check-in').length;
  const checkOutCount = recentAttendance.filter(r => r.status === 'check-out').length;
  const totalRecords = recentAttendance.length;

  return {
    activeEmployees,
    checkInCount,
    checkOutCount,
    totalRecords,
    groupedEmployees
  };
};
/**
 * Calculate daily summary from attendance records
 */
export const calculateDailySummaryFromRecords = (records, targetDate = null) => {
  if (!records || !Array.isArray(records) || records.length === 0) {
    return null;
  }

  const date = targetDate ? new Date(targetDate) : new Date();
  const dateString = date.toDateString();

  const dayRecords = records.filter(record => {
    const recordDate = new Date(record.timestamp);
    return recordDate.toDateString() === dateString;
  });

  if (dayRecords.length === 0) {
    return null;
  }

  const sortedRecords = dayRecords.sort((a, b) =>
    new Date(a.timestamp) - new Date(b.timestamp)
  );

  const checkInRecord = sortedRecords.find(r => r.status === 'check-in');
  const checkOutRecord = [...sortedRecords].reverse().find(r => r.status === 'check-out');

  let totalHours = null;
  let workingMinutes = 0;

  if (checkInRecord && checkOutRecord) {
    const checkInTime = new Date(checkInRecord.timestamp);
    const checkOutTime = new Date(checkOutRecord.timestamp);
    const diffMs = checkOutTime - checkInTime;
    workingMinutes = Math.floor(diffMs / (1000 * 60));

    const hours = Math.floor(workingMinutes / 60);
    const minutes = workingMinutes % 60;
    totalHours = `${hours}:${minutes.toString().padStart(2, '0')}`;
  }

  let status = 'not-started';
  if (checkOutRecord) {
    status = 'completed';
  } else if (checkInRecord) {
    status = 'in-progress';
  }

  return {
    date: date.toISOString().split('T')[0],
    checkInTime: checkInRecord?.timestamp || null,
    checkOutTime: checkOutRecord?.timestamp || null,
    totalHours: totalHours,
    workingMinutes: workingMinutes,
    status: status,
    employeeId: checkInRecord?.employeeId || checkOutRecord?.employeeId,
    recordCount: dayRecords.length,
    _calculated: true,
  };
};

/**
 * Format time duration in hours and minutes
 */
export const formatDuration = (minutes) => {
  if (!minutes || minutes <= 0) return '0:00';

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}:${mins.toString().padStart(2, '0')}`;
};

/**
 * Get attendance status for a specific date
 */
export const getAttendanceStatusForDate = (records, targetDate = null) => {
  const date = targetDate ? new Date(targetDate) : new Date();
  const dateString = date.toDateString();

  const dayRecords = records?.filter(record => {
    const recordDate = new Date(record.timestamp);
    return recordDate.toDateString() === dateString;
  }) || [];

  if (dayRecords.length === 0) {
    return {
      status: 'not-started',
      canCheckIn: true,
      canCheckOut: false,
      message: 'Ready to start work day'
    };
  }

  const summary = calculateDailySummaryFromRecords(records, targetDate);

  if (!summary) {
    return {
      status: 'not-started',
      canCheckIn: true,
      canCheckOut: false,
      message: 'Ready to start work day'
    };
  }

  switch (summary.status) {
    case 'completed':
      return {
        status: 'checked-out',
        canCheckIn: false,
        canCheckOut: false,
        message: 'Work day completed'
      };
    case 'in-progress':
      return {
        status: 'checked-in',
        canCheckIn: false,
        canCheckOut: true,
        message: 'Currently checked in'
      };
    default:
      return {
        status: 'not-started',
        canCheckIn: true,
        canCheckOut: false,
        message: 'Ready to start work day'
      };
  }
};

/**
 * Calculate weekly summary from records
 */
export const calculateWeeklySummary = (records) => {
  if (!records || !Array.isArray(records)) {
    return {
      totalDays: 0,
      totalHours: '0:00',
      totalMinutes: 0,
      averageHours: '0:00',
      daysWorked: [],
    };
  }

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 6);

  const weeklyData = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const dailySummary = calculateDailySummaryFromRecords(records, currentDate);
    if (dailySummary) {
      weeklyData.push(dailySummary);
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  const totalMinutes = weeklyData.reduce((sum, day) => sum + (day.workingMinutes || 0), 0);
  const totalDays = weeklyData.filter(day => day.status === 'completed').length;
  const averageMinutes = totalDays > 0 ? Math.round(totalMinutes / totalDays) : 0;

  return {
    totalDays: totalDays,
    totalHours: formatDuration(totalMinutes),
    totalMinutes: totalMinutes,
    averageHours: formatDuration(averageMinutes),
    daysWorked: weeklyData,
  };
};
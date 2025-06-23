export const dateUtils = {
  // Safely format date for API (YYYY-MM-DD)
  formatForAPI: (date) => {
    if (!date) {
      return new Date().toISOString().split('T')[0];
    }

    let dateObj;

    if (typeof date === 'string') {
      // Check if already in YYYY-MM-DD format
      if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return date;
      }
      dateObj = new Date(date);
    } else if (date instanceof Date) {
      dateObj = date;
    } else {
      console.warn('Invalid date type provided to formatForAPI:', typeof date, date);
      return new Date().toISOString().split('T')[0];
    }

    if (isNaN(dateObj.getTime())) {
      console.warn('Invalid date provided to formatForAPI:', date);
      return new Date().toISOString().split('T')[0];
    }

    return dateObj.toISOString().split('T')[0];
  },

  // Validate if a date string is valid
  isValidDateString: (dateString) => {
    if (!dateString || typeof dateString !== 'string') {
      return false;
    }

    // Check format first
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return false;
    }

    // Check if it's a valid date
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  },

  // Get today's date in YYYY-MM-DD format
  getTodayString: () => {
    return new Date().toISOString().split('T')[0];
  },

  // Format date for display
  formatDate: (date, formatType = 'MMM dd, yyyy') => {
    if (!date) return '';

    let dateObj;
    if (typeof date === 'string') {
      dateObj = new Date(date);
    } else if (date instanceof Date) {
      dateObj = date;
    } else {
      return '';
    }

    if (isNaN(dateObj.getTime())) {
      return '';
    }

    try {
      // Simple format mapping since we're not using date-fns
      if (formatType === 'MMM dd, yyyy') {
        return dateObj.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      } else if (formatType === 'yyyy-MM-dd') {
        return dateObj.toISOString().split('T')[0];
      } else if (formatType === 'dd/MM/yyyy') {
        return dateObj.toLocaleDateString('en-GB');
      } else {
        // Default format
        return dateObj.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      }
    } catch (error) {
      console.warn('Error formatting date:', error);
      return '';
    }
  },

  // Format time
  formatTime: (date) => {
    if (!date) return '';

    let dateObj;
    if (typeof date === 'string') {
      dateObj = new Date(date);
    } else if (date instanceof Date) {
      dateObj = date;
    } else {
      return '';
    }

    if (isNaN(dateObj.getTime())) {
      return '';
    }

    return dateObj.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  },

  // Format datetime
  formatDateTime: (date) => {
    if (!date) return '';

    let dateObj;
    if (typeof date === 'string') {
      dateObj = new Date(date);
    } else if (date instanceof Date) {
      dateObj = date;
    } else {
      return '';
    }

    if (isNaN(dateObj.getTime())) {
      return '';
    }

    return dateObj.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  },

  // Get start of current month
  getStartOfMonth: () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  },

  // Get end of today
  getEndOfToday: () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  },

  // Check if date is today
  isToday: (date) => {
    const today = new Date();
    let checkDate;

    if (typeof date === 'string') {
      checkDate = new Date(date);
    } else if (date instanceof Date) {
      checkDate = date;
    } else {
      return false;
    }

    if (isNaN(checkDate.getTime())) {
      return false;
    }

    return today.toDateString() === checkDate.toDateString();
  },

  // Get start of week (Monday)
  getStartOfWeek: (date = new Date()) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday
    return new Date(d.setDate(diff));
  },

  // Get end of week (Sunday)
  getEndOfWeek: (date = new Date()) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? 0 : 7); // adjust when day is Sunday
    return new Date(d.setDate(diff));
  },

  // Add days to a date
  addDays: (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  },

  // Subtract days from a date
  subtractDays: (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() - days);
    return result;
  },

  // Get difference in days between two dates
  getDaysDifference: (date1, date2) => {
    const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    const firstDate = new Date(date1);
    const secondDate = new Date(date2);

    return Math.round(Math.abs((firstDate - secondDate) / oneDay));
  },

  // Check if date is weekend
  isWeekend: (date) => {
    const d = new Date(date);
    const day = d.getDay();
    return day === 0 || day === 6; // Sunday or Saturday
  },

  // Get month name
  getMonthName: (monthIndex) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthIndex] || '';
  },

  // Get day name
  getDayName: (dayIndex) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayIndex] || '';
  },

  // Parse ISO date string
  parseISO: (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  },

  // Check if date is valid
  isValid: (date) => {
    if (!date) return false;
    const d = new Date(date);
    return d instanceof Date && !isNaN(d.getTime());
  }
};

export default dateUtils;
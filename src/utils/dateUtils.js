import { format, startOfMonth, endOfDay, parseISO, isValid } from 'date-fns';

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
      return format(dateObj, formatType);
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
    return startOfMonth(new Date());
  },

  // Get end of today
  getEndOfToday: () => {
    return endOfDay(new Date());
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
  }
};

export default dateUtils;
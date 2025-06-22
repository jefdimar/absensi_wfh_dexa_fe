import { format, startOfMonth, endOfDay, parseISO } from 'date-fns';
import { DATE_FORMATS } from '@/constants';

export const dateUtils = {
  // Format date for display
  formatDate: (date, formatType = DATE_FORMATS.DISPLAY) => {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatType);
  },

  // Format date for API
  formatForAPI: (date) => {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, DATE_FORMATS.API);
  },

  // Format time
  formatTime: (date) => {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, DATE_FORMATS.TIME);
  },

  // Format datetime
  formatDateTime: (date) => {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, DATE_FORMATS.DATETIME);
  },

  // Get start of current month
  getStartOfMonth: () => {
    return startOfMonth(new Date());
  },

  // Get end of today
  getEndOfToday: () => {
    return endOfDay(new Date());
  },

  // Get today's date string
  getTodayString: () => {
    return format(new Date(), DATE_FORMATS.API);
  },

  // Check if date is today
  isToday: (date) => {
    const today = new Date();
    const checkDate = typeof date === 'string' ? parseISO(date) : date;
    return format(today, DATE_FORMATS.API) === format(checkDate, DATE_FORMATS.API);
  }
};
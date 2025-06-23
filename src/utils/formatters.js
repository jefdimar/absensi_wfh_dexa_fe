/**
 * Formatting utilities for dates, times, and other data
 */

export const formatTime = (timeString) => {
  if (!timeString) return "N/A";
  try {
    const date = new Date(timeString);
    if (isNaN(date.getTime())) return "Invalid Time";

    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  } catch (error) {
    console.error("Error formatting time:", error);
    return "Invalid Time";
  }
};

export const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid Date";
  }
};

export const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return "N/A";
  try {
    const date = new Date(dateTimeString);
    if (isNaN(date.getTime())) return "Invalid DateTime";

    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  } catch (error) {
    console.error("Error formatting datetime:", error);
    return "Invalid DateTime";
  }
};

export const getCurrentDate = () => {
  return new Date().toISOString().split("T")[0];
};

export const isValidDate = (dateString) => {
  if (!dateString) return false;
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
};

export const isFutureDate = (dateString) => {
  if (!isValidDate(dateString)) return false;

  const inputDate = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  inputDate.setHours(0, 0, 0, 0);

  return inputDate > today;
};

export const isPastDate = (dateString) => {
  if (!isValidDate(dateString)) return false;

  const inputDate = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  inputDate.setHours(0, 0, 0, 0);

  return inputDate < today;
};

export const isToday = (dateString) => {
  if (!isValidDate(dateString)) return false;

  const inputDate = new Date(dateString);
  const today = new Date();

  return inputDate.toDateString() === today.toDateString();
};

export const getRelativeDate = (dateString) => {
  if (!isValidDate(dateString)) return "Invalid Date";

  const inputDate = new Date(dateString);
  const today = new Date();
  const diffTime = today - inputDate;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays === -1) return "Tomorrow";
  if (diffDays > 1) return `${diffDays} days ago`;
  if (diffDays < -1) return `In ${Math.abs(diffDays)} days`;

  return formatDate(dateString);
};

export const formatDuration = (startTime, endTime) => {
  if (!startTime || !endTime) return "N/A";

  try {
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) return "Invalid";

    const diffMs = end - start;
    if (diffMs < 0) return "Invalid";

    const diffHours = diffMs / (1000 * 60 * 60);
    const hours = Math.floor(diffHours);
    const minutes = Math.floor((diffHours - hours) * 60);

    if (hours === 0) return `${minutes}m`;
    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes}m`;
  } catch (error) {
    console.error("Error calculating duration:", error);
    return "N/A";
  }
};
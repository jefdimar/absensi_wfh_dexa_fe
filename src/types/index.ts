// Auth types
export interface User {
  id: string;
  name: string;
  email: string;
  profilePhoto?: string;
  jobPosition: string;
  phoneNumber?: string;
  role: "employee" | "admin";
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// Attendance types
export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  checkInTime?: string;
  checkOutTime?: string;
  status: "checked-in" | "checked-out" | "absent";
}

// Profile types
export interface ProfileUpdateData {
  profilePhoto?: string;
  phoneNumber?: string;
  password?: string;
}

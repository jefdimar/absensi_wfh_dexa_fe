// Just export some example structures for reference
export const USER_ROLES = {
  EMPLOYEE: "employee",
  ADMIN: "admin",
};

export const ATTENDANCE_STATUS = {
  CHECKED_IN: "checked-in",
  CHECKED_OUT: "checked-out",
  ABSENT: "absent",
};

// Example user object structure (for reference)
export const USER_EXAMPLE = {
  id: "",
  name: "",
  email: "",
  profilePhoto: "",
  jobPosition: "",
  phoneNumber: "",
  role: USER_ROLES.EMPLOYEE,
};

// Example attendance record structure (for reference)
export const ATTENDANCE_EXAMPLE = {
  id: "",
  employeeId: "",
  date: "",
  checkInTime: "",
  checkOutTime: "",
  status: ATTENDANCE_STATUS.CHECKED_IN,
};

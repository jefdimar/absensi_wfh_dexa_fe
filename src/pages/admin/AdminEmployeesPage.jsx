import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { adminService } from "../../services/adminService";
import toast from "react-hot-toast";

const AdminEmployeesPage = () => {
  const { logout } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // 'add' or 'edit'
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    position: "",
    phoneNumber: "",
  });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, [currentPage, searchTerm]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      console.log("AdminEmployees: Fetching employees...", {
        currentPage,
        searchTerm,
      });

      const response = await adminService.getAllEmployees(
        currentPage,
        10,
        searchTerm
      );

      console.log("AdminEmployees: API response:", response);

      setEmployees(response.employees || response.data || []);
      setTotalPages(
        response.totalPages || Math.ceil((response.totalCount || 0) / 10)
      );
      setTotalCount(response.totalCount || response.total || 0);
    } catch (error) {
      console.error("AdminEmployees: Error fetching employees:", error);
      toast.error("Failed to load employees");
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleAddEmployee = () => {
    setModalMode("add");
    setFormData({
      name: "",
      email: "",
      password: "",
      position: "",
      phoneNumber: "",
    });
    setSelectedEmployee(null);
    setShowModal(true);
  };

  const handleEditEmployee = (employee) => {
    setModalMode("edit");
    setFormData({
      name: employee.name || "",
      email: employee.email || "",
      password: "", // Don't pre-fill password
      position: employee.position || "",
      phoneNumber: employee.phoneNumber || "",
    });
    setSelectedEmployee(employee);
    setShowModal(true);
  };

  const handleDeleteEmployee = async (employeeId, employeeName) => {
    if (!window.confirm(`Are you sure you want to delete ${employeeName}?`)) {
      return;
    }

    try {
      console.log("AdminEmployees: Deleting employee:", employeeId);
      await adminService.deleteEmployee(employeeId);
      toast.success("Employee deleted successfully");
      fetchEmployees();
    } catch (error) {
      console.error("AdminEmployees: Error deleting employee:", error);
      toast.error(error.message || "Failed to delete employee");
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      if (modalMode === "add") {
        console.log("AdminEmployees: Adding employee:", formData);
        await adminService.addEmployee(formData);
        toast.success("Employee added successfully");
      } else {
        const updateData = { ...formData };
        if (!updateData.password) {
          delete updateData.password; // Don't update password if empty
        }
        console.log(
          "AdminEmployees: Updating employee:",
          selectedEmployee.id,
          updateData
        );
        await adminService.updateEmployee(selectedEmployee.id, updateData);
        toast.success("Employee updated successfully");
      }

      setShowModal(false);
      fetchEmployees();
    } catch (error) {
      console.error("AdminEmployees: Error saving employee:", error);
      toast.error(
        error.message ||
          (modalMode === "add"
            ? "Failed to add employee"
            : "Failed to update employee")
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="container mt-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="mb-1">
                <i className="bi bi-people me-2"></i>
                Manage Employees
              </h1>
              <p className="text-muted mb-0">
                Add, edit, and manage employee accounts ({totalCount} total)
              </p>
            </div>
            <div className="d-flex gap-2">
              <button
                className="btn btn-outline-secondary"
                onClick={() => (window.location.href = "/admin")}
              >
                <i className="bi bi-arrow-left me-1"></i>
                Back to Dashboard
              </button>
              <button className="btn btn-outline-danger" onClick={logout}>
                <i className="bi bi-box-arrow-right me-1"></i>
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Add */}
      <div className="row mb-4">
        <div className="col-md-8">
          <div className="input-group">
            <span className="input-group-text">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search employees by name or email..."
              value={searchTerm}
              onChange={handleSearch}
            />
            {searchTerm && (
              <button
                className="btn btn-outline-secondary"
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setCurrentPage(1);
                }}
              >
                <i className="bi bi-x"></i>
              </button>
            )}
          </div>
        </div>
        <div className="col-md-4">
          <button className="btn btn-primary w-100" onClick={handleAddEmployee}>
            <i className="bi bi-person-plus me-1"></i>
            Add New Employee
          </button>
        </div>
      </div>

      {/* Employees Table */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="bi bi-list me-1"></i>
                Employees List
                {searchTerm && (
                  <small className="text-muted ms-2">
                    (filtered by "{searchTerm}")
                  </small>
                )}
              </h5>
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={fetchEmployees}
                disabled={loading}
              >
                <i className="bi bi-arrow-clockwise me-1"></i>
                {loading ? "Loading..." : "Refresh"}
              </button>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="text-muted mt-2">Loading employees...</p>
                </div>
              ) : employees.length === 0 ? (
                <div className="text-center py-4">
                  <i className="bi bi-inbox fs-1 text-muted"></i>
                  <p className="text-muted mt-2">
                    {searchTerm
                      ? "No employees found matching your search"
                      : "No employees found"}
                  </p>
                  {searchTerm && (
                    <button
                      className="btn btn-outline-primary"
                      onClick={() => {
                        setSearchTerm("");
                        setCurrentPage(1);
                      }}
                    >
                      Clear Search
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Position</th>
                          <th>Phone</th>
                          <th>Role</th>
                          <th>Created</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {employees.map((employee) => (
                          <tr key={employee.id}>
                            <td>
                              <div className="d-flex align-items-center">
                                <div className="avatar-circle me-2">
                                  {employee.name?.charAt(0)?.toUpperCase() ||
                                    "U"}
                                </div>
                                <div>
                                  <strong>{employee.name}</strong>
                                  {employee.role === "admin" && (
                                    <span className="badge bg-danger ms-2">
                                      Admin
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td>{employee.email}</td>
                            <td>{employee.position || "N/A"}</td>
                            <td>{employee.phoneNumber || "N/A"}</td>
                            <td>
                              <span
                                className={`badge ${
                                  employee.role === "admin"
                                    ? "bg-danger"
                                    : "bg-primary"
                                }`}
                              >
                                {employee.role || "employee"}
                              </span>
                            </td>
                            <td>{formatDate(employee.createdAt)}</td>
                            <td>
                              <div className="btn-group" role="group">
                                <button
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => handleEditEmployee(employee)}
                                  title="Edit Employee"
                                >
                                  <i className="bi bi-pencil"></i>
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() =>
                                    handleDeleteEmployee(
                                      employee.id,
                                      employee.name
                                    )
                                  }
                                  title="Delete Employee"
                                  disabled={employee.role === "admin"} // Prevent deleting admin users
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <nav className="mt-3">
                      <ul className="pagination justify-content-center">
                        <li
                          className={`page-item ${
                            currentPage === 1 ? "disabled" : ""
                          }`}
                        >
                          <button
                            className="page-link"
                            onClick={() => setCurrentPage(currentPage - 1)}
                            disabled={currentPage === 1}
                          >
                            <i className="bi bi-chevron-left"></i>
                            Previous
                          </button>
                        </li>

                        {/* Page numbers */}
                        {[...Array(Math.min(5, totalPages))].map((_, index) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = index + 1;
                          } else if (currentPage <= 3) {
                            pageNum = index + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + index;
                          } else {
                            pageNum = currentPage - 2 + index;
                          }

                          return (
                            <li
                              key={pageNum}
                              className={`page-item ${
                                currentPage === pageNum ? "active" : ""
                              }`}
                            >
                              <button
                                className="page-link"
                                onClick={() => setCurrentPage(pageNum)}
                              >
                                {pageNum}
                              </button>
                            </li>
                          );
                        })}

                        <li
                          className={`page-item ${
                            currentPage === totalPages ? "disabled" : ""
                          }`}
                        >
                          <button
                            className="page-link"
                            onClick={() => setCurrentPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                          >
                            Next
                            <i className="bi bi-chevron-right"></i>
                          </button>
                        </li>
                      </ul>

                      <div className="text-center mt-2">
                        <small className="text-muted">
                          Page {currentPage} of {totalPages} ({totalCount} total
                          employees)
                        </small>
                      </div>
                    </nav>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Add/Edit Employee */}
      {showModal && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i
                    className={`bi ${
                      modalMode === "add" ? "bi-person-plus" : "bi-pencil"
                    } me-2`}
                  ></i>
                  {modalMode === "add" ? "Add New Employee" : "Edit Employee"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <form onSubmit={handleFormSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter full name"
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter email address"
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">
                      Password{" "}
                      {modalMode === "add"
                        ? "*"
                        : "(leave empty to keep current)"}
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required={modalMode === "add"}
                      placeholder={
                        modalMode === "add"
                          ? "Enter password"
                          : "Leave empty to keep current password"
                      }
                      minLength="8"
                    />
                    {modalMode === "add" && (
                      <div className="form-text">
                        Password must be at least 8 characters long
                      </div>
                    )}
                  </div>
                  <div className="mb-3">
                    <label htmlFor="position" className="form-label">
                      Position
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="position"
                      name="position"
                      value={formData.position}
                      onChange={handleInputChange}
                      placeholder="Enter job position"
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="phoneNumber" className="form-label">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      className="form-control"
                      id="phoneNumber"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={formLoading}
                  >
                    {formLoading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-1"
                          role="status"
                        ></span>
                        {modalMode === "add" ? "Adding..." : "Updating..."}
                      </>
                    ) : (
                      <>
                        <i
                          className={`bi ${
                            modalMode === "add" ? "bi-plus" : "bi-check"
                          } me-1`}
                        ></i>
                        {modalMode === "add"
                          ? "Add Employee"
                          : "Update Employee"}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .avatar-circle {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background-color: #007bff;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 16px;
        }
      `}</style>
    </div>
  );
};

export default AdminEmployeesPage;

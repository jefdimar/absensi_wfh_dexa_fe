import React, { useState, useRef, useEffect } from "react";

const Dropdown = ({ trigger, children, className = "", align = "end" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`dropdown ${className}`} ref={dropdownRef}>
      <div onClick={toggleDropdown} style={{ cursor: "pointer" }}>
        {trigger}
      </div>

      {isOpen && (
        <div
          className={`dropdown-menu show dropdown-menu-${align}`}
          style={{ position: "absolute", zIndex: 1000 }}
        >
          {children}
        </div>
      )}
    </div>
  );
};

export const DropdownItem = ({
  children,
  onClick,
  className = "",
  disabled = false,
}) => {
  const handleClick = (e) => {
    e.preventDefault();
    if (!disabled && onClick) {
      onClick();
    }
  };

  return (
    <button
      className={`dropdown-item ${className} ${disabled ? "disabled" : ""}`}
      onClick={handleClick}
      disabled={disabled}
      type="button"
    >
      {children}
    </button>
  );
};

export const DropdownDivider = () => <hr className="dropdown-divider" />;

export const DropdownHeader = ({ children }) => (
  <h6 className="dropdown-header">{children}</h6>
);

export default Dropdown;

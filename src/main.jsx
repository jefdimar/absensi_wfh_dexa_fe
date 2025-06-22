import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

// Import Bootstrap CSS only (no JS)
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

// Import custom styles
import "./styles/dashboard.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

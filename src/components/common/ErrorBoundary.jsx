import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    this.setState({
      error: error,
      errorInfo: errorInfo,
    });
  }

  handleRefresh = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = "/login";
  };

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-md-6">
                <div className="card shadow-lg border-0">
                  <div className="card-body text-center p-5">
                    <div className="text-danger mb-4">
                      <i
                        className="bi bi-exclamation-triangle"
                        style={{ fontSize: "4rem" }}
                      ></i>
                    </div>
                    <h3 className="text-danger mb-3">
                      Oops! Something went wrong
                    </h3>
                    <p className="text-muted mb-4">
                      We encountered an unexpected error. Please try refreshing
                      the page.
                    </p>

                    {/* Only show error details in development and if errorInfo exists */}
                    {process.env.NODE_ENV === "development" &&
                      this.state.error && (
                        <details className="text-start mb-4">
                          <summary className="btn btn-outline-secondary btn-sm mb-2">
                            Show Error Details (Development)
                          </summary>
                          <div className="alert alert-danger text-start">
                            <strong>Error:</strong>{" "}
                            {this.state.error.toString()}
                            <br />
                            {this.state.errorInfo &&
                              this.state.errorInfo.componentStack && (
                                <>
                                  <strong>Component Stack:</strong>
                                  <pre className="mt-2 small">
                                    {this.state.errorInfo.componentStack}
                                  </pre>
                                </>
                              )}
                            {this.state.error.stack && (
                              <>
                                <strong>Stack Trace:</strong>
                                <pre className="mt-2 small">
                                  {this.state.error.stack}
                                </pre>
                              </>
                            )}
                          </div>
                        </details>
                      )}

                    <div className="d-grid gap-2">
                      <button
                        className="btn btn-primary"
                        onClick={this.handleRefresh}
                      >
                        <i className="bi bi-arrow-clockwise me-2"></i>
                        Refresh Page
                      </button>
                      <button
                        className="btn btn-outline-secondary"
                        onClick={this.handleGoHome}
                      >
                        <i className="bi bi-house me-2"></i>
                        Go to Login
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

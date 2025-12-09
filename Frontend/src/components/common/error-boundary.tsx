// Frontend/src/components/common/error-boundary.tsx
import React from "react";

type ErrorBoundaryProps = {
  children: React.ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
};

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // You can send this to Sentry/logging later
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReload = () => {
    // hard reload to reset router/app state
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full bg-white rounded-xl shadow-md p-6 space-y-4 text-center">
            <h1 className="text-lg font-semibold text-gray-900">
              Something went wrong
            </h1>
            <p className="text-sm text-gray-600">
              An unexpected error occurred while loading the dashboard. Please
              refresh the page to try again.
            </p>

            <button
              type="button"
              onClick={this.handleReload}
              className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-[var(--sgss-navy)] text-white text-sm font-medium hover:bg-[var(--sgss-navy)]/90"
            >
              Reload page
            </button>

            {process.env.NODE_ENV === "development" && this.state.error && (
              <pre className="mt-4 max-h-40 overflow-auto whitespace-pre-wrap text-xs text-red-500 text-left">
                {this.state.error.message}
              </pre>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

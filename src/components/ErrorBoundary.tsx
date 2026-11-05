"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { children: ReactNode; fallback?: ReactNode };
type State = { hasError: boolean; error: Error | null };

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // In production, send to a crash-reporting service.
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="mx-auto max-w-md p-6 text-center">
            <p className="text-4xl">💥</p>
            <h1 className="mt-2 text-xl font-black">Something snapped in the field kit.</h1>
            <p className="mt-1 text-sm text-inksoft">
              {this.state.error?.message ?? "An unexpected error occurred."}
            </p>
            <button
              className="btn btn-accent mt-4"
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
            >
              Reload the page
            </button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}

"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { IconWarning } from "./icons/AppIcons";

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
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-amber-100 border-2 border-amber-300 text-amber-700 mx-auto mb-3 shadow-sm">
              <IconWarning size={36} />
            </div>
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

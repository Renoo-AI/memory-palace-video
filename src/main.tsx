import { Component, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface ErrorBoundaryState {
  error: Error | null;
}

class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex h-screen w-screen items-center justify-center bg-[#F5EEDD] p-6 text-[#1E1B18]">
          <div className="max-w-md border-[3px] border-[#1E1B18] bg-[#FAF5E8] p-6">
            <h1 className="text-base font-bold">Unable to render Palace One-Take</h1>
            <p className="mt-2 text-xs text-[#E8472F]">{this.state.error.message}</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);

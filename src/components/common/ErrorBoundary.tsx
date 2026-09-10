import { Component, ReactNode, ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  props: Props;
  state: State;

  constructor(props: Props) {
    super(props);
    this.props = props;
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in MY LEARNING component tree:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0a0908] text-neutral-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full p-6 rounded-2xl bg-[#141210] border border-amber-900/30 text-center shadow-2xl">
            <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-mono text-xl">
              !
            </div>
            <h1 className="text-xl font-semibold text-neutral-100 mb-2">
              Something went wrong
            </h1>
            <p className="text-sm text-neutral-400 mb-6 leading-relaxed">
              MY LEARNING encountered an unexpected issue. Your study progress and streak are saved safely in your browser.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                id="error-boundary-reload-btn"
                onClick={this.handleReload}
                className="px-4 py-2.5 rounded-xl bg-amber-500 text-neutral-950 font-medium hover:bg-amber-400 transition-colors shadow-sm text-sm cursor-pointer"
              >
                Reload Page
              </button>
              <button
                type="button"
                id="error-boundary-home-btn"
                onClick={this.handleGoHome}
                className="px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 font-medium hover:bg-neutral-800 hover:text-white transition-colors text-sm cursor-pointer"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}





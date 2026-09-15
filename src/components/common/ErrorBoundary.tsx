import { Component, ReactNode, ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  isExpanded: boolean;
  copied: boolean;
}

/**
 * Sanitizes strings to prevent inadvertent exposure of secrets or tokens.
 */
function sanitize(text?: string | null): string {
  if (!text) return '';
  return text
    .replace(/bot\d+:[A-Za-z0-9_-]+/g, '[REDACTED_BOT_TOKEN]')
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, 'Bearer [REDACTED_TOKEN]')
    .replace(/mylearning_session=[^;\s]+/gi, 'mylearning_session=[REDACTED]')
    .replace(/(password|token|secret|cookie|auth)=[^&\s;]+/gi, '$1=[REDACTED]');
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      isExpanded: false,
      copied: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("MY LEARNING RUNTIME ERROR", {
      name: error?.name,
      message: error?.message,
      route: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
      componentStack: errorInfo?.componentStack
    });
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleCopy = async () => {
    const { error, errorInfo } = this.state;
    const route = typeof window !== 'undefined' ? window.location.pathname : 'unknown';
    const textToCopy = [
      `Name: ${sanitize(error?.name || 'Error')}`,
      `Message: ${sanitize(error?.message || 'Unknown error')}`,
      `Route: ${route}`,
      errorInfo?.componentStack ? `Component Stack:\n${sanitize(errorInfo.componentStack)}` : '',
    ].filter(Boolean).join('\n');

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = textToCopy;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2500);
    } catch {
      // Fallback
    }
  };

  render() {
    if (this.state.hasError) {
      const currentRoute = typeof window !== 'undefined' ? window.location.pathname : 'unknown';

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

            {/* Expandable Debug Error Section */}
            <div className="mt-6 pt-4 border-t border-neutral-800/80 text-left">
              <button
                type="button"
                id="toggle-debug-error-btn"
                onClick={() => this.setState((prev) => ({ isExpanded: !prev.isExpanded }))}
                className="text-xs font-mono font-medium text-amber-500/80 hover:text-amber-400 flex items-center justify-between w-full py-1 cursor-pointer transition-colors"
              >
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block"></span>
                  DEBUG ERROR
                </span>
                <span className="text-[10px] text-neutral-400">
                  {this.state.isExpanded ? 'Hide ▲' : 'Expand ▼'}
                </span>
              </button>

              {this.state.isExpanded && (
                <div className="mt-3 p-3.5 rounded-xl bg-black/60 border border-neutral-800 text-xs font-mono space-y-3">
                  <div>
                    <span className="text-neutral-500 block text-[10px] uppercase tracking-wider">Error Name</span>
                    <span className="text-red-400 font-semibold break-all">
                      {sanitize(this.state.error?.name || 'Error')}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block text-[10px] uppercase tracking-wider">Error Message</span>
                    <span className="text-neutral-200 break-all leading-relaxed">
                      {sanitize(this.state.error?.message || 'No error message provided')}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block text-[10px] uppercase tracking-wider">Current Route</span>
                    <span className="text-amber-400 break-all">{currentRoute}</span>
                  </div>
                  {this.state.errorInfo?.componentStack && (
                    <div>
                      <span className="text-neutral-500 block text-[10px] uppercase tracking-wider">Component Stack</span>
                      <pre className="text-[10px] text-neutral-400 mt-1 max-h-40 overflow-y-auto whitespace-pre-wrap bg-neutral-950 p-2 rounded border border-neutral-800 font-mono leading-normal">
                        {sanitize(this.state.errorInfo.componentStack)}
                      </pre>
                    </div>
                  )}
                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      id="copy-debug-error-btn"
                      onClick={this.handleCopy}
                      className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-amber-300 font-mono text-xs transition-colors flex items-center gap-1.5 cursor-pointer border border-neutral-750"
                    >
                      {this.state.copied ? '✓ Copied to Clipboard!' : '📋 Copy Debug Error'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}





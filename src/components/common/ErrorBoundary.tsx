import { Component, ErrorInfo, ReactNode } from 'react';
import { LiziMascot } from '../mascot/LiziMascot';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('LIZULINGO UI Crash caught by ErrorBoundary:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F7F7F7] dark:bg-[#131F24] flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border-2 border-lizu-gray dark:border-gray-700 shadow-xl max-w-sm w-full flex flex-col items-center gap-4">
            <LiziMascot mood="sad" size={100} />
            <h2 className="text-xl font-black text-gray-900 dark:text-gray-100">
              რაღაც შეცდომა მოხდა
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              არ ინერვიულოთ, თქვენი შენახული პროგრესი დაცულია.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="btn-3d-green w-full py-3 text-sm font-black mt-2"
            >
              თავიდან ჩატვირთვა 🔄
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

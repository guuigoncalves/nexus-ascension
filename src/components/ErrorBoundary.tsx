import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("=== ERROR BOUNDARY CAUGHT ERROR ===");
        console.error("Error:", error);
        console.error("Error Info:", errorInfo);
        console.error("Stack:", error.stack);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="p-4 bg-red-900 text-white min-h-screen">
                    <h1 className="text-2xl font-bold mb-4">Ops! Algo deu errado.</h1>
                    <pre className="bg-black p-4 rounded overflow-auto">
                        {this.state.error?.toString()}
                    </pre>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;

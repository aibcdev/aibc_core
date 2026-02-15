import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
    children?: ReactNode;
    name?: string;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error in', this.props.name, error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="p-8 m-8 bg-red-900/20 border border-red-500 rounded-xl text-white">
                    <h1 className="text-xl font-bold mb-2">Component Crashed: {this.props.name}</h1>
                    <pre className="text-red-300 text-sm overflow-auto p-4 bg-black/50 rounded-lg">
                        {this.state.error?.toString()}
                    </pre>
                </div>
            );
        }

        return this.props.children;
    }
}

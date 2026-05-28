import { Component, ReactNode } from "react";
interface Props {
    children: ReactNode;
}
interface State {
    hasError: boolean;
    error: Error | null;
}
declare class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props);
    static getDerivedStateFromError(error: Error): State;
    render(): string | number | boolean | import("react/jsx-runtime").JSX.Element | Iterable<ReactNode> | null | undefined;
}
export default ErrorBoundary;

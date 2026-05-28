/**
 * Message type matching server-side LLM Message interface
 */
export type Message = {
    role: "system" | "user" | "assistant";
    content: string;
};
export type AIChatBoxProps = {
    /**
     * Messages array to display in the chat.
     * Should match the format used by invokeLLM on the server.
     */
    messages: Message[];
    /**
     * Callback when user sends a message.
     * Typically you'll call a tRPC mutation here to invoke the LLM.
     */
    onSendMessage: (content: string) => void;
    /**
     * Whether the AI is currently generating a response
     */
    isLoading?: boolean;
    /**
     * Placeholder text for the input field
     */
    placeholder?: string;
    /**
     * Custom className for the container
     */
    className?: string;
    /**
     * Height of the chat box (default: 600px)
     */
    height?: string | number;
    /**
     * Empty state message to display when no messages
     */
    emptyStateMessage?: string;
    /**
     * Suggested prompts to display in empty state
     * Click to send directly
     */
    suggestedPrompts?: string[];
};
/**
 * A ready-to-use AI chat box component that integrates with the LLM system.
 *
 * Features:
 * - Matches server-side Message interface for seamless integration
 * - Markdown rendering with Streamdown
 * - Auto-scrolls to latest message
 * - Loading states
 * - Uses global theme colors from index.css
 *
 * @example
 * ```tsx
 * const ChatPage = () => {
 *   const [messages, setMessages] = useState<Message[]>([
 *     { role: "system", content: "You are a helpful assistant." }
 *   ]);
 *
 *   const chatMutation = trpc.ai.chat.useMutation({
 *     onSuccess: (response) => {
 *       // Assuming your tRPC endpoint returns the AI response as a string
 *       setMessages(prev => [...prev, {
 *         role: "assistant",
 *         content: response
 *       }]);
 *     },
 *     onError: (error) => {
 *       console.error("Chat error:", error);
 *       // Optionally show error message to user
 *     }
 *   });
 *
 *   const handleSend = (content: string) => {
 *     const newMessages = [...messages, { role: "user", content }];
 *     setMessages(newMessages);
 *     chatMutation.mutate({ messages: newMessages });
 *   };
 *
 *   return (
 *     <AIChatBox
 *       messages={messages}
 *       onSendMessage={handleSend}
 *       isLoading={chatMutation.isPending}
 *       suggestedPrompts={[
 *         "Explain quantum computing",
 *         "Write a hello world in Python"
 *       ]}
 *     />
 *   );
 * };
 * ```
 */
export declare function AIChatBox({ messages, onSendMessage, isLoading, placeholder, className, height, emptyStateMessage, suggestedPrompts, }: AIChatBoxProps): import("react/jsx-runtime").JSX.Element;

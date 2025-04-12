import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Bot, User, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { getOpenRouterService, ChatMessage } from "@/services/openRouterService";
import { apiConfig, validateApiConfig } from "@/config/apiConfig";
import React from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isTyping?: boolean; // Flag to indicate if a message is currently typing
  fullContent?: string; // The full content that will be gradually revealed
};

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi there! I'm your debt management assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [apiAvailable, setApiAvailable] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingSpeed = 15; // milliseconds per character

  // Check API configuration on component mount
  useEffect(() => {
    const isApiConfigValid = validateApiConfig();
    setApiAvailable(isApiConfigValid);

    if (!isApiConfigValid) {
      toast.error("API configuration is missing. Chat functionality may be limited.");
    }
  }, []);

  // Effect for typing animation
  useEffect(() => {
    const typingMessage = messages.find(msg => msg.isTyping && msg.fullContent);

    if (typingMessage && typingMessage.content.length < typingMessage.fullContent!.length) {
      const timeout = setTimeout(() => {
        // Add the next character
        const nextChar = typingMessage.fullContent!.charAt(typingMessage.content.length);

        setMessages(prevMessages => prevMessages.map(msg =>
          msg === typingMessage
            ? {
              ...msg,
              content: msg.content + nextChar
            }
            : msg
        ));
      }, typingSpeed);

      return () => clearTimeout(timeout);
    } else if (typingMessage && typingMessage.content.length === typingMessage.fullContent!.length) {
      // Animation completed
      setMessages(prevMessages => prevMessages.map(msg =>
        msg === typingMessage
          ? {
            ...msg,
            isTyping: false,
            // Remove the fullContent property as it's no longer needed
            fullContent: undefined
          }
          : msg
      ));
    }
  }, [messages]);

  // Converts our Message type to the format expected by OpenRouter
  const formatMessagesForApi = (messages: Message[]): ChatMessage[] => {
    // Add a system message to provide context about the assistant's purpose
    const systemMessage: ChatMessage = {
      role: "system",
      content: "You are a helpful debt management assistant called DebtWise. You provide advice on debt management strategies, financial planning, and help users understand their debt situation. Be concise, factual, and supportive. Always recommend responsible financial practices."
    };

    // Convert the UI message format to API format
    const formattedMessages: ChatMessage[] = messages.map(msg => ({
      role: msg.role,
      content: msg.fullContent || msg.content
    }));

    return [systemMessage, ...formattedMessages];
  };

  // Function to get response from OpenRouter Gemini API
  const getAIResponse = async (messages: Message[]): Promise<string> => {
    if (!apiAvailable) {
      return simulateResponse(messages[messages.length - 1].content);
    }

    try {
      const formattedMessages = formatMessagesForApi(messages);
      return await getOpenRouterService().chatCompletion(formattedMessages);
    } catch (error) {
      console.error("Error getting AI response:", error);
      toast.error("Failed to get AI response. Falling back to simulation.");
      return simulateResponse(messages[messages.length - 1].content);
    }
  };

  // Mock LLM response function as fallback
  const simulateResponse = async (query: string): Promise<string> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const responses = [
      "Based on your debt information, I'd recommend focusing on the highest interest credit card first. Would you like me to create a payment plan for you?",
      "Looking at your student loans, refinancing could save you about $2,300 in interest over the loan term. Would you like to see some options?",
      "I notice you're spending about 40% of your income on debt payments. The recommended maximum is 36%. Let's look at ways to reduce this.",
      "Your debt-to-income ratio is currently 0.42, which puts you in a moderate risk category. Let's work on strategies to improve this.",
      "Based on your payment history, you're on track to be debt-free in approximately 5.5 years. We could potentially reduce this to 3.8 years with some adjustments."
    ];

    if (query.toLowerCase().includes("credit card")) {
      return "For your $5,000 credit card debt, I recommend using the 'debt avalanche' method: focus on the highest interest card first while making minimum payments on others. If you can add $200 extra per month, you could be debt-free in approximately 18 months instead of 6 years, saving around $2,300 in interest.";
    } else if (query.toLowerCase().includes("student loan")) {
      return "For your student loans, there are several options: income-driven repayment plans could reduce monthly payments, or refinancing might lower your interest rate if you have good credit. The Public Service Loan Forgiveness program might also be available if you work in qualifying employment. Would you like more details on any of these options?";
    } else {
      return responses[Math.floor(Math.random() * responses.length)];
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsProcessing(true);

    try {
      // Get response from OpenRouter Gemini API
      const currentMessages = [...messages, userMessage];
      const response = await getAIResponse(currentMessages);

      // Add assistant message with typing animation
      const assistantMessage: Message = {
        role: "assistant",
        content: "", // Start with empty content
        fullContent: response, // Store the full response
        isTyping: true, // Mark as currently typing
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      toast.error("Sorry, I couldn't process your request. Please try again.");
      console.error("Error generating response:", error);
    } finally {
      setIsProcessing(false);
    }
  };

 
  // Function to check if a message is being typed
  const isMessageTyping = (message: Message): boolean => {
    return !!message.isTyping;
  };

  return (
    <div className="flex flex-col h-full glass-card rounded-3xl overflow-hidden ">
      <div className="p-4 border-b border-secondary/100 bg-black">
        <h2 className="text-3xl font-bold flex items-center gap-2">
          <Bot className="h-5 w-5 text-debt-bright" />
          <span>Patel Sahab{!apiAvailable && " (Simulation Mode)"}</span>
        </h2>
      </div>

      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-950">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div className={`
              max-w-[80%] rounded-lg p-3 
              ${msg.role === "user"
                ? "bg-debt-navy text-white"
                : "bg-debt-slate/40 text-white border border-debt-slate/60 rounded-xl"}
            `}>
              <div className="flex items-start gap-2">
                {msg.role === "assistant" ? (
                  <Bot className="h-5 w-5 text-debt-bright shrink-0 mt-1" />
                ) : (
                  <User className="h-5 w-5 text-debt-cream shrink-0 mt-1" />
                )}
                <p className="whitespace-pre-wrap">
                  {msg.content}
                  {isMessageTyping(msg) && <span className="typing-cursor">|</span>}
                </p>
              </div>
              <div className="text-xs text-slate-400 mt-1 text-right">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-secondary/70 bg-slate-950">
        <div className="flex gap-2 ">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question about debt management..."
            className="resize-none bg-secondary/50 rounded-xl"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (input.trim()) handleSubmit(e);
              }
            }}
          />
          <Button
            type="submit"
            disabled={isProcessing || !input.trim()}
            className="bg-debt-teal hover:bg-debt-bright text-white shrink-0 rounded-xl"
          >
            {isProcessing ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;

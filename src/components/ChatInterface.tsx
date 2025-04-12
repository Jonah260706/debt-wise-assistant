
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Bot, User, RefreshCw } from "lucide-react";
import { toast } from "sonner";

type Message = {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock LLM response function
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
      // Get response from LLM
      const response = await simulateResponse(input);
      
      // Add assistant message
      const assistantMessage: Message = {
        role: "assistant",
        content: response,
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

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-full glass-card rounded-lg overflow-hidden">
      <div className="p-4 border-b border-secondary/70 bg-secondary/70">
        <h2 className="text-lg font-medium flex items-center gap-2">
          <Bot className="h-5 w-5 text-debt-bright" />
          <span>DebtWise Assistant</span>
        </h2>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg, index) => (
          <div 
            key={index}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div className={`
              max-w-[80%] rounded-lg p-3 
              ${msg.role === "user" 
                ? "bg-debt-navy text-white" 
                : "bg-debt-slate/40 text-white border border-debt-slate/60"}
            `}>
              <div className="flex items-start gap-2">
                {msg.role === "assistant" ? (
                  <Bot className="h-5 w-5 text-debt-bright shrink-0 mt-1" />
                ) : (
                  <User className="h-5 w-5 text-debt-cream shrink-0 mt-1" />
                )}
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
              <div className="text-xs text-slate-400 mt-1 text-right">
                {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="p-4 border-t border-secondary/70">
        <div className="flex gap-2">
          <Textarea 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question about debt management..."
            className="resize-none bg-secondary/50"
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
            className="bg-debt-teal hover:bg-debt-bright text-white shrink-0"
          >
            {isProcessing ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;

import { toast } from "sonner";

export type ChatMessage = {
    role: "user" | "assistant" | "system";
    content: string;
};

export type OpenRouterResponse = {
    id: string;
    model: string;
    choices: {
        message: {
            role: string;
            content: string;
        };
        finish_reason: string;
    }[];
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
};

/**
 * Service for interacting with OpenRouter API to access Google Gemini model
 */
class OpenRouterService {
    private apiKey: string;
    private baseUrl = "https://openrouter.ai/api/v1";
    private modelId = "google/gemini-pro"; // Gemini Pro model ID

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    /**
     * Send a chat completion request to OpenRouter using Google Gemini
     */
    async chatCompletion(messages: ChatMessage[]): Promise<string> {
        try {
            const response = await fetch(`${this.baseUrl}/chat/completions`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${this.apiKey}`,
                    "HTTP-Referer": window.location.origin, // Required by OpenRouter
                    "X-Title": "DebtWise Assistant" // App name for OpenRouter analytics
                },
                body: JSON.stringify({
                    model: this.modelId,
                    messages: messages,
                    temperature: 0.7,
                    max_tokens: 1024
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("OpenRouter API error:", errorData);
                throw new Error(errorData.error?.message || "Failed to get response from OpenRouter");
            }

            const data: OpenRouterResponse = await response.json();

            if (data.choices && data.choices.length > 0) {
                return data.choices[0].message.content;
            } else {
                throw new Error("No response content received");
            }
        } catch (error) {
            console.error("Error in OpenRouter request:", error);
            toast.error("Failed to get AI response. Please try again.");
            throw error;
        }
    }
}

// Export a singleton instance that will be initialized with API key later
let openRouterService: OpenRouterService | null = null;

export const initOpenRouterService = (apiKey: string): void => {
    openRouterService = new OpenRouterService(apiKey);
};

export const getOpenRouterService = (): OpenRouterService => {
    if (!openRouterService) {
        throw new Error("OpenRouterService must be initialized with API key first");
    }
    return openRouterService;
}; 
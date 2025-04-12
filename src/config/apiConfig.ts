/**
 * Application configuration for API keys and services
 */

// Environment variables with fallbacks
export const apiConfig = {
    openRouterApiKey: import.meta.env.VITE_OPENROUTER_API_KEY || '',
};

/**
 * Check if all required API configurations are set
 */
export const validateApiConfig = (): boolean => {
    const missingKeys: string[] = [];

    if (!apiConfig.openRouterApiKey) {
        missingKeys.push('VITE_OPENROUTER_API_KEY');
    }

    if (missingKeys.length > 0) {
        console.error(`Missing required environment variables: ${missingKeys.join(', ')}`);
        return false;
    }

    return true;
}; 
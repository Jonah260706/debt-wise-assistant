// Type declarations for modules without their own type definitions

declare module 'lucide-react' {
    import { ComponentType, SVGAttributes } from 'react';

    interface IconProps extends SVGAttributes<SVGElement> {
        color?: string;
        size?: string | number;
    }

    export type Icon = ComponentType<IconProps>;

    export const Send: Icon;
    export const Bot: Icon;
    export const User: Icon;
    export const RefreshCw: Icon;
    // Add other icons as needed
}

declare module 'sonner' {
    export const toast: {
        success: (message: string, options?: any) => void;
        error: (message: string, options?: any) => void;
        info: (message: string, options?: any) => void;
        warning: (message: string, options?: any) => void;
        loading: (message: string, options?: any) => Promise<void>;
        dismiss: (toastId?: string) => void;
        custom: (content: React.ReactNode, options?: any) => void;
    };
} 
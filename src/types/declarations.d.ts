// This file provides temporary type declarations while waiting for proper installations

// React
declare module 'react' {
  export * from 'react';
}

// Next.js
declare module 'next/link';
declare module 'next/image';
declare module 'next/navigation' {
  export function useRouter(): {
    push: (url: string) => void;
    replace: (url: string) => void;
    back: () => void;
  };
  export function usePathname(): string;
}

// Lucide React
declare module 'lucide-react';

// Framer Motion
declare module 'framer-motion' {
  export const motion: {
    div: any;
    span: any;
    button: any;
    [key: string]: any;
  };
  
  export const AnimatePresence: React.FC<{
    children?: React.ReactNode;
  }>;
  
  export type Transition = {
    type?: string;
    duration?: number;
    delay?: number;
  };
}

// Add React namespace for JSX
declare namespace React {
  interface CSSProperties {
    [key: string]: any;
  }
}

// Add JSX namespace
declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
} 
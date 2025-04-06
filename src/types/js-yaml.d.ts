// Type declaration for js-yaml to satisfy TypeScript
declare module 'js-yaml' {
    export function load(str: string, opts?: any): any;
    export function dump(obj: any, opts?: any): string;
    // Add other functions you might use from js-yaml if needed
  } 
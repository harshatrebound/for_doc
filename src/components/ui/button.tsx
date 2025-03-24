import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5C9E] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          {
            'bg-[#8B5C9E] text-white hover:bg-[#7B4C8E]':
              variant === 'default',
            'bg-destructive text-white hover:bg-destructive/90':
              variant === 'destructive',
            'border border-[#8B5C9E] bg-white text-[#8B5C9E] hover:bg-[#8B5C9E]/10':
              variant === 'outline',
            'bg-[#8B5C9E]/10 text-[#8B5C9E] hover:bg-[#8B5C9E]/20':
              variant === 'secondary',
            'text-[#8B5C9E] hover:bg-[#8B5C9E]/10': variant === 'ghost',
            'text-[#8B5C9E] underline-offset-4 hover:underline':
              variant === 'link',
            'h-10 px-4 py-2': size === 'default',
            'h-9 rounded-md px-3': size === 'sm',
            'h-11 rounded-md px-8': size === 'lg',
            'h-10 w-10': size === 'icon',
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button }; 
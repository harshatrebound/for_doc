import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * A utility function for conditionally joining Tailwind CSS classes together.
 * Uses `clsx` to manage conditional classes and `tailwind-merge` to handle duplications
 * and conflicts properly.
 * 
 * @param inputs - The className values to be conditionally merged
 * @returns The merged className string with proper handling of Tailwind classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
} 
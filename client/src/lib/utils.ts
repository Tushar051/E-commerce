import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
}

export function calculateDiscountPercentage(price: number, compareAtPrice: number | null): number | null {
  if (!compareAtPrice || compareAtPrice <= price) return null;
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
}

export function getStarRating(rating: number): { full: number; half: number; empty: number } {
  if (!rating) {
    return { full: 0, half: 0, empty: 5 };
  }
  
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  
  return { full, half, empty };
}

export function getProductUrl(slug: string): string {
  return `/products/${slug}`;
}

export function getCategoryUrl(slug: string): string {
  return `/categories/${slug}`;
}

export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

export function generateImagePlaceholder(text: string): string {
  const colors = [
    'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 
    'bg-red-500', 'bg-purple-500', 'bg-pink-500'
  ];
  
  // Use the first letter of the text and a random color
  const firstLetter = text.charAt(0).toUpperCase();
  const colorIndex = text.length % colors.length;
  
  return `https://via.placeholder.com/300x300/${colors[colorIndex].replace('bg-', '')}/${
    firstLetter === '' ? '...' : firstLetter
  }`;
}

export function getOrderStatusBadge(status: string): { 
  label: string; 
  variant: 'default' | 'secondary' | 'destructive' | 'outline' 
} {
  switch (status) {
    case 'pending':
      return { label: 'Pending', variant: 'secondary' };
    case 'processing':
      return { label: 'Processing', variant: 'default' };
    case 'completed':
      return { label: 'Completed', variant: 'outline' };
    case 'cancelled':
      return { label: 'Cancelled', variant: 'destructive' };
    default:
      return { label: status, variant: 'outline' };
  }
}

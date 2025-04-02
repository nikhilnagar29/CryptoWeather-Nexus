import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatRelativeTime = (dateString: string) => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    const formatter = new Intl.RelativeTimeFormat('en', { style: 'short' });
    
    if (diffInSeconds < 60) return formatter.format(-diffInSeconds, 'second');
    if (diffInSeconds < 3600) return formatter.format(-Math.floor(diffInSeconds / 60), 'minute');
    if (diffInSeconds < 86400) return formatter.format(-Math.floor(diffInSeconds / 3600), 'hour');
    return formatter.format(-Math.floor(diffInSeconds / 86400), 'day');
  } catch (error) {
    return 'Recently';
  }
};
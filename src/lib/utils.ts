import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getCurrencySymbol(currencyCode?: string, useCodeFallback = false) {
    if (useCodeFallback) {
        return currencyCode || 'USD';
    }
    switch(currencyCode) {
        case 'USD': return '$';
        case 'EUR': return '€';
        case 'GBP': return '£';
        case 'JPY': return '¥';
        case 'INR': return '₹';
        case 'BDT': return '৳';
        default: return '$';
    }
}

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}



export const formatAmount = (amount: number, pow = 6) => {
  return amount * 10 ** pow;
};


export function formatCurrency(amt: number, decimals = 6) {
	return amt / Math.pow(10, decimals);
}

export async function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Simple utilities shared across rbxts projects

export function assertDefined<T>(value: T | undefined | null, message = 'Expected value to be defined'): T {
  if (value === undefined || value === null) throw new Error(message);
  return value as T;
}

export function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max);
}

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

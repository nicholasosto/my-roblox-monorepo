// Local vendored utils to avoid cross-package tsconfig issues during rbxtsc

export function assertDefined<T>(value: T | undefined, message = "Expected value to be defined"): T {
  if (value === undefined) error(message);
  return value as T;
}

export function clamp(n: number, min: number, max: number) {
  const a = n < min ? min : n;
  return a > max ? max : a;
}

export function delay(ms: number) {
  const seconds = ms / 1000;
  task.wait(seconds);
}

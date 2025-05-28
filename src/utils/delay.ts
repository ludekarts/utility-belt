/**
 * Debounce callback fn.
 *
 * @example
 *
 * const debouncedFn = debounce(() => console.log("Hello"), 1000);
 */
export function debounce<T extends (...args: any[]) => void>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeout: number;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => callback(...args), delay);
  };
}

/**
 * Call callback function if it is called within delta time range.
 *
 * @example
 *
 * const rapidCallback = triggerIfRapid(() => console.log("Rapid call!"), 500);
 */
export function triggerIfRapid<T extends (...args: any[]) => void>(
  callback: T,
  delta: number
): (...args: Parameters<T>) => void {
  let lastTime = 0;
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastTime <= delta) {
      callback(...args);
      lastTime = 0; // Reset to prevent repeated triggers
    } else {
      lastTime = now;
    }
  };
}

/**
 * Call callback function on firt call & wait for given amount of time, to call it again.
 *
 * @example
 * const throttledFn = throttle(() => console.log("Throttled call!"), 1000);
 */

export function throttle<T extends (...args: any[]) => void>(
  callback: T,
  wait: number
): (...args: Parameters<T>) => void {
  let isThrottled = false;
  return (...args: Parameters<T>) => {
    if (!isThrottled) {
      callback(...args);
      isThrottled = true;
      setTimeout(() => (isThrottled = false), wait);
    }
  };
}

/**
 * Wait for given amount of time.
 *
 * @example
 *
 * await wait(1000); // Waits for 1 second
 */

export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

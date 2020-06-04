// Debounce callback fn.
export function debounce (callback, delay, immediate) {
  let timeout;
  return (...args) => {
    const later = () => {
      timeout = null;
      !immediate && callback(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, delay);
    immediate && !timeout && callback(...args);
  };
};

// Call callback function if it is called within delta time range.
export const inDeltaTime = (callback, delta) => {
  let startTime, currentTime = 0;
  return (...args) => {
    startTime = new Date();
    if (startTime - currentTime <= delta) {
      callback.apply(this, args);
      startTime = 0;
    }
    currentTime = startTime;
  }
};

// Call callback function on firt call & wait for given amount of time, to call it again.
export function throttle (callback, wait) {
  let timeout, block = false;
  return (...args) => {
    if (!block) {
      clearTimeout(timeout);
      callback.apply(this, args);
      block = true;
      timeout = setTimeout(() => block = false, wait);
    }
  };
};



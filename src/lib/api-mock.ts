export const delay = (minMs: number = 1000, maxMs: number = 3000): Promise<void> => {
  const delayMs = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  return new Promise((resolve) => setTimeout(resolve, delayMs));
};

export const mockApiCall = async <T>(
  fn: () => Promise<T>,
  options: {
    minDelay?: number;
    maxDelay?: number;
  } = {}
): Promise<T> => {
  const { minDelay = 1000, maxDelay = 3000 } = options;

  await delay(minDelay, maxDelay);

  return await fn();
};

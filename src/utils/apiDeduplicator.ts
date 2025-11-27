
const pendingCalls = new Map<string, Promise<any>>();
const callTimestamps = new Map<string, number>();

export const deduplicateApiCall = <T>(
  key: string,
  apiCall: () => Promise<T>,
  cacheDuration = 5 * 60 * 1000 
): Promise<T> => {
  const now = Date.now();
  const lastCall = callTimestamps.get(key);

  if (lastCall && (now - lastCall) < cacheDuration) {
    return Promise.reject(new Error('Duplicate call prevented'));
  }
  if (pendingCalls.has(key)) {
    return pendingCalls.get(key)!;
  }

  const promise = apiCall()
    .then((result) => {
      callTimestamps.set(key, now);
      pendingCalls.delete(key);
      return result;
    })
    .catch((error) => {
      pendingCalls.delete(key);
      throw error;
    });
  
  pendingCalls.set(key, promise);
  return promise;
};

export const clearApiCache = (key?: string) => {
  if (key) {
    pendingCalls.delete(key);
    callTimestamps.delete(key);
  } else {
    pendingCalls.clear();
    callTimestamps.clear();
  }
};
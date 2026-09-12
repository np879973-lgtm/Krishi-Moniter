// Retry Manager with Exponential Backoff for Krishi Mentor (Part 8)
import { SyncQueueItem } from '../types';

export interface RetryConfig {
  baseDelayMs: number;
  maxDelayMs: number;
  maxRetries: number;
  jitterFactor: number;
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  baseDelayMs: 2000,    // 2 seconds
  maxDelayMs: 60000,    // 60 seconds
  maxRetries: 4,        // 4 attempts
  jitterFactor: 0.2,    // +/- 20% jitter to prevent thundering herd
};

/**
 * Calculates the next retry timestamp using exponential backoff:
 * delay = min(maxDelay, baseDelay * 2^(retryCount)) * (1 + jitter)
 */
export function calculateNextRetry(
  retryCount: number,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): { nextRetryAt: number; delayMs: number; hasExceededMax: boolean } {
  if (retryCount >= config.maxRetries) {
    return {
      nextRetryAt: 0,
      delayMs: 0,
      hasExceededMax: true,
    };
  }

  const rawDelay = Math.min(
    config.maxDelayMs,
    config.baseDelayMs * Math.pow(2, retryCount)
  );

  // Add slight random jitter
  const jitter = (Math.random() * 2 - 1) * config.jitterFactor;
  const delayMs = Math.round(rawDelay * (1 + jitter));
  const nextRetryAt = Date.now() + delayMs;

  return {
    nextRetryAt,
    delayMs,
    hasExceededMax: false,
  };
}

/**
 * Updates a queue item after a failure, advancing its retry counter and scheduling next retry
 */
export function prepareItemRetry(
  item: SyncQueueItem,
  errorMessage: string,
  errorCode = 'NETWORK_ERROR',
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): SyncQueueItem {
  const currentRetries = item.retryCount + 1;
  const { nextRetryAt, hasExceededMax } = calculateNextRetry(currentRetries, config);

  return {
    ...item,
    retryCount: currentRetries,
    lastAttemptAt: Date.now(),
    nextRetryAt: hasExceededMax ? undefined : nextRetryAt,
    status: hasExceededMax ? 'FAILED' : 'PENDING',
    errorCode,
    errorMessage,
    updatedAt: Date.now(),
  };
}

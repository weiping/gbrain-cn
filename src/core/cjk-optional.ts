/**
 * Optional CJK enhancement layer.
 *
 * Provides optional integration with nodejieba for improved Chinese word
 * segmentation when available, with graceful fallback to native bigram tokenization.
 *
 * This module is lazy-loaded and only activated when:
 * 1. nodejieba is installed in node_modules
 * 2. GBRAIN_USE_NODEJIEBA=true is set
 *
 * Without this enhancement, CJK search still works via the native
 * chineseBigram() function in pglite-engine.ts and postgres-engine.ts.
 */

let nodejiebaLoaded = false;
let nodejiebaInstance: any = null;

// Test-only: reset nodejieba state for testing
export function _resetNodejiebaStateForTests() {
  nodejiebaLoaded = false;
  nodejiebaInstance = null;
}

/**
 * Initialize nodejieba if available and enabled.
 *
 * @returns true if nodejieba is available, false otherwise
 */
export async function initNodejieba(): Promise<boolean> {
  // Check if explicitly enabled
  if (process.env.GBRAIN_USE_NODEJIEBA !== 'true') {
    return false;
  }

  // Already loaded
  if (nodejiebaLoaded && nodejiebaInstance) {
    return true;
  }

  try {
    // Try to dynamically import nodejieba (optional dependency)
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore — nodejieba is an optional dependency, may not be installed
    const module = await import('nodejieba');
    nodejiebaInstance = module.default;
    nodejiebaLoaded = true;
    return true;
  } catch {
    // nodejieba not installed or failed to load
    return false;
  }
}

/**
 * Segment Chinese text using nodejieba if available, otherwise fall back
 * to native character-level tokenization.
 *
 * @param text - The Chinese text to segment
 * @returns Array of tokens/words
 */
export function segmentChinese(text: string): string[] {
  if (!text) return [];

  // If nodejieba is loaded and available, use it
  if (nodejiebaLoaded && nodejiebaInstance) {
    try {
      const tokens = nodejiebaInstance.cut(text);
      return Array.isArray(tokens) ? tokens : [tokens];
    } catch {
      // Fall through to native implementation on error
    }
  }

  // Native fallback: split into individual characters
  return text.split('').filter(c => /[\u4e00-\u9fa5]/.test(c));
}

/**
 * Check if nodejieba is available for use.
 *
 * @returns true if nodejieba is loaded and ready
 */
export function isNodejiebaAvailable(): boolean {
  return nodejiebaLoaded && nodejiebaInstance !== null;
}

/**
 * Advanced Chinese bigram tokenization with optional word-boundary awareness.
 *
 * When nodejieba is available, this produces better quality tokens by
 * respecting word boundaries. When not available, falls back to simple
 * character bigrams.
 *
 * @param text - The text to tokenize
 * @returns Space-separated tokens for FTS indexing
 */
export function enhancedChineseBigram(text: string): string {
  if (!text) return '';

  if (nodejiebaLoaded && nodejiebaInstance) {
    try {
      // Use nodejieba for word segmentation, then generate bigrams from words
      const words = nodejiebaInstance.cut(text);
      const tokens: string[] = [];

      for (const word of words) {
        if (word.trim() === '') continue;

        // Add the full word
        tokens.push(word.trim());

        // Add bigrams within the word (2+ character words)
        const chars = [...word];
        for (let i = 0; i < chars.length - 1; i++) {
          tokens.push(chars[i] + chars[i + 1]);
        }
      }

      return tokens.join(' ');
    } catch {
      // Fall through to native implementation
    }
  }

  // Native fallback: simple character + bigram tokenization
  const chars = [...text.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, ' ')];
  const single = chars.join(' ');
  const bigrams: string[] = [];
  for (let i = 0; i < chars.length - 1; i++) {
    bigrams.push(chars[i] + chars[i + 1]);
  }
  return single + (bigrams.length > 0 ? ' ' + bigrams.join(' ') : '');
}

/**
 * Get status of CJK enhancement layer.
 *
 * @returns Status object with availability details
 */
export function getCjkStatus(): {
  nodejiebaAvailable: boolean;
  nodejiebaEnabled: boolean;
  method: 'nodejieba' | 'native';
} {
  const available = isNodejiebaAvailable();
  return {
    nodejiebaAvailable: available,
    nodejiebaEnabled: available && process.env.GBRAIN_USE_NODEJIEBA === 'true',
    method: available ? 'nodejieba' : 'native',
  };
}

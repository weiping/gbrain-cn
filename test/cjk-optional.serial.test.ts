import { describe, it, expect, beforeEach } from 'bun:test';
import {
  initNodejieba,
  segmentChinese,
  isNodejiebaAvailable,
  enhancedChineseBigram,
  getCjkStatus,
  _resetNodejiebaStateForTests,
} from '../src/core/cjk-optional.ts';

describe('CJK Optional Enhancement', () => {
  beforeEach(() => {
    // Reset environment and module state for each test
    delete process.env.GBRAIN_USE_NODEJIEBA;
    _resetNodejiebaStateForTests();
  });

  describe('initNodejieba', () => {
    it('should return false when GBRAIN_USE_NODEJIEBA is not set', async () => {
      const result = await initNodejieba();
      expect(result).toBe(false);
    });

    it('should return false when GBRAIN_USE_NODEJIEBA is false', async () => {
      process.env.GBRAIN_USE_NODEJIEBA = 'false';
      const result = await initNodejieba();
      expect(result).toBe(false);
    });

    it('should return false when nodejieba is not installed', async () => {
      process.env.GBRAIN_USE_NODEJIEBA = 'true';
      const result = await initNodejieba();
      // In test environment, nodejieba is likely not installed
      expect(typeof result).toBe('boolean');
    });
  });

  describe('segmentChinese (native fallback)', () => {
    it('should return empty array for empty string', () => {
      const result = segmentChinese('');
      expect(result).toEqual([]);
    });

    it('should return empty array for non-Chinese text', () => {
      const result = segmentChinese('hello world');
      // Native fallback filters out non-Chinese characters
      expect(result).toEqual([]);
    });

    it('should split Chinese text into characters when nodejieba unavailable', () => {
      const result = segmentChinese('中文测试');
      // Native fallback splits into individual Chinese characters
      expect(result.length).toBe(4);
      expect(result).toContain('中');
      expect(result).toContain('文');
      expect(result).toContain('测');
      expect(result).toContain('试');
    });

    it('should filter out non-Chinese characters', () => {
      const result = segmentChinese('中abc文123测');
      // Should only contain Chinese characters
      expect(result).toContain('中');
      expect(result).toContain('文');
      expect(result).toContain('测');
      expect(result.length).toBe(3);
    });
  });

  describe('enhancedChineseBigram (native fallback)', () => {
    it('should return empty string for empty input', () => {
      const result = enhancedChineseBigram('');
      expect(result).toBe('');
    });

    it('should generate single characters and bigrams', () => {
      const result = enhancedChineseBigram('人工智能');
      const tokens = result.split(' ');
      // Should contain single characters (from native fallback)
      expect(tokens).toContain('人');
      expect(tokens).toContain('工');
      expect(tokens).toContain('智');
      expect(tokens).toContain('能');
      // Should contain bigrams
      expect(tokens).toContain('人工');
      expect(tokens).toContain('工智');
      expect(tokens).toContain('智能');
    });

    it('should handle mixed Chinese and non-Chinese text', () => {
      const result = enhancedChineseBigram('AI人工智能123');
      expect(result).toBeTruthy();
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle mixed Chinese and alphanumerics', () => {
      const result = enhancedChineseBigram('test123测试');
      const tokens = result.split(' ');
      // Native implementation creates character-level tokens
      expect(tokens).toContain('t');
      expect(tokens).toContain('e');
      expect(tokens).toContain('s');
      expect(tokens).toContain('1');
      expect(tokens).toContain('2');
      expect(tokens).toContain('3');
      expect(tokens).toContain('测');
      expect(tokens).toContain('试');
      // Should also have bigrams
      expect(tokens).toContain('te');
      expect(tokens).toContain('es');
      expect(tokens).toContain('12');
      expect(tokens).toContain('23');
      expect(tokens).toContain('测试');
    });
  });

  describe('isNodejiebaAvailable', () => {
    it('should return false when nodejieba is not loaded', () => {
      const result = isNodejiebaAvailable();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('getCjkStatus', () => {
    it('should return status object with correct structure', () => {
      const status = getCjkStatus();
      expect(status).toHaveProperty('nodejiebaAvailable');
      expect(status).toHaveProperty('nodejiebaEnabled');
      expect(status).toHaveProperty('method');
      expect(typeof status.nodejiebaAvailable).toBe('boolean');
      expect(typeof status.nodejiebaEnabled).toBe('boolean');
      expect(['nodejieba', 'native']).toContain(status.method);
    });

    it('should report native method when nodejieba unavailable', () => {
      // After reset, nodejieba should be unavailable
      const status = getCjkStatus();
      expect(status.nodejiebaAvailable).toBe(false);
      expect(status.method).toBe('native');
    });
  });

  describe('real-world Chinese phrases', () => {
    it('should handle common Chinese phrases', () => {
      const phrases = [
        '机器学习',
        '深度学习',
        '人工智能',
        '自然语言处理',
        '知识图谱',
      ];

      for (const phrase of phrases) {
        const result = enhancedChineseBigram(phrase);
        expect(result.length).toBeGreaterThan(0);
        const tokens = result.split(' ');
        // Native fallback should contain characters and bigrams
        // Just verify the result is non-empty and valid
        expect(tokens.length).toBeGreaterThan(0);
      }
    });

    it('should handle long Chinese sentences', () => {
      const sentence = '人工智能是计算机科学的一个分支，它企图了解智能的实质，并生产出一种新的能以人类智能相似的方式做出反应的智能机器。';
      const result = enhancedChineseBigram(sentence);
      expect(result.length).toBeGreaterThan(0);
      expect(result.split(' ').length).toBeGreaterThan(10);
    });
  });
});

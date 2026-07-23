import type { Recipe } from '../types.ts';

/**
 * Zhipu AI (智谱AI) — Coding 端点 (`/api/coding/paas/v4`).
 *
 * Same BigModel platform and the same `ZHIPUAI_API_KEY` as the canonical
 * `zhipu` recipe (`/api/paas/v4`), but served from the coding-focused API
 * path. Registered as a SEPARATE recipe (not a base_url override on `zhipu`)
 * so it can coexist in a `chat_fallback_chain`:
 *
 *   chat_fallback_chain: ['zhipu:glm-4.6', 'zhipu-coding:glm-4.7']
 *
 * — `zhipu:glm-4.6` covers a single-model outage on the primary endpoint,
 *   `zhipu-coding:glm-4.7` covers a primary-ENDPOINT outage (coding path on
 *   different infra). Only the `chat` touchpoint is declared: this recipe
 *   exists for chat fallback, not as an alternative embedder.
 *
 * API docs: https://open.bigmodel.cn/dev/api
 */
export const zhipuCoding: Recipe = {
  id: 'zhipu-coding',
  name: 'Zhipu AI Coding 端点 (智谱AI /api/coding/paas/v4)',
  tier: 'openai-compat',
  implementation: 'openai-compatible',
  base_url_default: 'https://open.bigmodel.cn/api/coding/paas/v4',
  auth_env: {
    required: ['ZHIPUAI_API_KEY'],
    setup_url: 'https://open.bigmodel.cn/usercenter/apikeys',
  },
  touchpoints: {
    chat: {
      models: ['glm-4-flash', 'glm-4.6', 'glm-4.7'],
      supports_tools: true,
      supports_subagent_loop: true,
      supports_prompt_cache: false,
      max_context_tokens: 128000,
      cost_per_1m_input_usd: 0.5,
      cost_per_1m_output_usd: 0.5,
      price_last_verified: '2026-04-22',
    },
  },
  setup_hint: 'Shares ZHIPUAI_API_KEY with the primary zhipu recipe. Get a key at https://open.bigmodel.cn/usercenter/apikeys',
};

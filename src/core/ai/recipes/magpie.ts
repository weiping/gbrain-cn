import type { Recipe } from '../types.ts';

/**
 * Magpie — 本地 OpenAI 兼容网关（magpie.app / `magpie` CLI）。
 *
 * magpie 在 127.0.0.1:3425 暴露一个 OpenAI-compatible 网关，把多个上游
 * （Bailian Token Plan、智谱、DeepSeek、Anthropic、OpenAI …）聚成一个
 * `/v1` 端点，模型 id 直接沿用 magpie 的目录命名：
 *
 *   bailian-token-plan/auto        百炼 Token Plan 的 auto 路由
 *   minimax-cn/MiniMax-M3.1-Flash  MiniMax M3.1 Flash
 *   group/mbridge                  mbridge 分级路由组
 *
 * 这里注册成独立 recipe（而不是复用 `litellm`），是为了让模型串保持
 * magpie 自己的语义：`magpie/bailian-token-plan/auto`。
 *
 * 注意 model id 里带斜杠（`bailian-token-plan/auto`）。gbrain 的
 * `parseModelId` 是「冒号优先、斜杠次之」，所以 `magpie/bailian-token-plan/auto`
 * 解析成 provider=`magpie`、model=`bailian-token-plan/auto`，
 * 而 `magpie:bailian-token-plan/auto` 同样成立 —— 两种写法都可用。
 *
 * 认证：本地网关默认不校验 Bearer（`Bearer unauthenticated` 会被忽略），
 * 所以 required 为空，和 ollama / llama-server 一致。若 magpie 后续开启
 * 校验，把 MAGPIE_API_KEY 放进 `~/.gbrain/.env` 即可（会自动折叠成
 * gateway env 里的 MAGPIE_API_KEY）。
 *
 * base URL：默认取 recipe 的 base_url_default；可用
 * `MAGPIE_BASE_URL` 环境变量或 config.json 的 `provider_base_urls.magpie`
 * 覆盖。
 */
export const magpie: Recipe = {
  id: 'magpie',
  name: 'Magpie (本地网关 / local gateway)',
  tier: 'openai-compat',
  implementation: 'openai-compatible',
  base_url_default: 'http://127.0.0.1:3425/v1',
  auth_env: {
    required: [], // 本地网关默认不校验；用户可给 MAGPIE_API_KEY
    optional: ['MAGPIE_BASE_URL', 'MAGPIE_API_KEY'],
    setup_url: 'https://magpie.ai',
  },
  // magpie 走的是订阅 / token plan，目录里没有统一的按 token 单价，
  // 所以列出来的模型都标为 unpriced（走默认成本上限 + 警告）。
  unpriced_models: ['bailian-token-plan/auto'],
  touchpoints: {
    chat: {
      // 目录是用户自管的，这个列表只做展示与默认，不做运行时白名单。
      models: ['bailian-token-plan/auto'],
      supports_tools: true,
      supports_subagent_loop: true,
      // OpenAI-compatible 路径不吃 Anthropic 的 cache_control 标记。
      supports_prompt_cache: false,
      // magpie 目录里的 bailian-token-plan/* 都接受 response_format json_schema。
      supports_structured_outputs: true,
      // magpie 路由到的模型（qwen3.8-max / glm-5.3 / deepseek-v4-pro …）
      // 默认带 reasoning_content，reasoning token 计入 max_tokens。
      // 不声明这个，4000 的默认输出上限会被推理吃光、返回空串。
      thinking_by_default: true,
      max_context_tokens: 1_000_000,
      // auto 路由偶尔会慢，给足超时。
      default_timeout_ms: 180_000,
    },
    expansion: {
      models: ['bailian-token-plan/auto'],
      default_timeout_ms: 180_000,
    },
  },
  setup_hint:
    'Start the local magpie gateway (magpie app / `magpie tui`), then use `magpie:<model-id>` (e.g. magpie:bailian-token-plan/auto). Override the endpoint with MAGPIE_BASE_URL or provider_base_urls.magpie in ~/.gbrain/config.json.',
};

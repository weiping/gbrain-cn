# GBrain（中文文档）

[English](README.md) | 中文

你的 AI Agent 聪明但健忘。GBrain 给它一个大脑。

基于 Y Combinator 总裁 Garry Tan 的真实 Agent 部署打造。生产环境大脑：**17,888 页、4,383 人、723 家公司**，21 个自动运行的 cron 任务，12 天建成。Agent 在你睡觉时摄入会议记录、邮件、推文、语音通话和原创想法；自动丰富每一个接触到的人和公司；在夜间修正引用、整合记忆。你醒来时，大脑比睡前更聪明。

大脑自动布线。每次写页面，系统都会零 LLM 调用地提取实体引用、创建类型化链接（`attended`、`works_at`、`invested_in`、`founded`、`advises`）。混合搜索 + 自动连线知识图谱 + 结构化时间线 + 反向链接排名加权。能回答"谁在某公司工作？"或"某人本季度投了什么？"这类纯向量搜索无法触达的问题。基准测试：在 240 页 Opus 生成的富文本语料库上，P@5 49.1%，R@5 97.9%，优于图谱禁用变体 **+31.4 P@5**，优于 ripgrep-BM25 + 纯向量 RAG 幅度相当。完整 BrainBench 评分卡和语料库在姊妹仓库 [gbrain-evals](https://github.com/garrytan/gbrain-evals)。

GBrain 是这些模式的通用化实现。34 个技能。30 分钟安装完毕。Agent 完成其余工作。

**v0.25.0 新增 — BrainBench-Real（会话捕获，贡献者模式）：** 在 shell 中设置 `GBRAIN_CONTRIBUTOR_MODE=1` 后，所有经由 MCP、CLI 或子 Agent 工具桥的真实 `query` + `search` 调用都会被 PII 脱敏后捕获到 `eval_candidates` 表中。通过 `gbrain eval export` 快照，`gbrain eval replay` 对比你的代码变更。返回三个指标：捕获与当前检索 slug 的平均 Jaccard@k、top-1 稳定率、延迟 Δ。**生产用户默认关闭**。文档：[docs/eval-bench.md](docs/eval-bench.md)。

**v0.28.8 新增 — 内置 LongMemEval：** `gbrain eval longmemeval <dataset.jsonl>` 在 gbrain 混合检索上运行公开的 [LongMemEval](https://huggingface.co/datasets/xiaowu0162/longmemeval) 基准测试。每次运行创建一个内存中的 PGLite 实例，Apple Silicon 上 p50 25.9ms/题。不触碰你的 `~/.gbrain` 大脑。

> **~30 分钟即可获得完整运行的大脑。** 数据库 2 秒就绪（PGLite，无需服务器）。只需回答几个 API Key 相关问题。

> **LLMs：** 获取 [`llms.txt`](llms.txt) 获得文档地图，或 [`llms-full.txt`](llms-full.txt) 获取内联了核心文档的单文件版本。**Agent：** 从 [`AGENTS.md`](AGENTS.md)（或 Claude Code 用户的 [`CLAUDE.md`](CLAUDE.md)）开始。

---

## gbrain-cn：智谱 AI 与 CJK 支持

> 这是 **gbrain-cn** 分支，在上游 gbrain 基础上增加了国产 AI 提供商支持与中日韩全文搜索。

### 新增特性

| 特性 | 说明 |
|---|---|
| **智谱 AI（Zhipu AI）** | `embedding-3`（1024 / 1536 / 2048 维），`glm-4.7` 用于聊天与查询扩展 |
| **CJK 搜索** | 内置双字切分器，无外部依赖，PGLite + Postgres 均支持 |
| **Nodejieba（可选）** | 专业中文分词，适用于技术/领域语料 |
| **中文 Wikilink 解析** | `[[中文标题]]` 通过向量搜索兜底，精确匹配失败时自动降级 |
| **可变嵌入维度** | `embedding-3` 支持 1024 / 1536 / 2048，通过 `EMBEDDING_DIMENSIONS` 配置 |

### 快速配置

```bash
# 1. 在 ~/.zshrc 中设置环境变量
export ZHIPU_API_KEY="your_key_here"
export EMBEDDING_MODEL="zhipu:embedding-3"
export EMBEDDING_DIMENSIONS="1536"
export EMBEDDING_BASE_URL="https://open.bigmodel.cn/api/paas/v4"
export CHAT_MODEL="zhipu:glm-4.7"
export EXPANSION_MODEL="zhipu:glm-4.7"

# 2. 初始化大脑
gbrain init

# 3. 同步并向量化
gbrain sync --repo ~/your-vault
gbrain embed --stale

# 4. 验证
gbrain doctor
```

在 [open.bigmodel.cn](https://open.bigmodel.cn/usercenter/apikeys) 获取 API Key。

完整指南：[智谱 AI 配置](docs/guides/zhipu-ai-setup.md) · [可变维度](docs/guides/zhipu-ai-dimensions.md) · [CJK 搜索](docs/cjk-enhancement.md)

---

## 安装

### 通过 Agent 平台安装（推荐）

GBrain 设计为由 AI Agent 来安装和操作。如果你还没有运行中的 Agent：

- **[OpenClaw](https://openclaw.ai)** ... 在 Render 一键部署 [AlphaClaw](https://render.com/deploy?repo=https://github.com/chrysb/alphaclaw)（需要 8GB+ RAM）
- **[Hermes Agent](https://github.com/NousResearch/hermes-agent)** ... 在 [Railway 一键部署](https://github.com/praveen-ks-2001/hermes-agent-template)

将以下内容粘贴给你的 Agent：

```
Retrieve and follow the instructions at:
https://raw.githubusercontent.com/garrytan/gbrain/master/INSTALL_FOR_AGENTS.md
```

Agent 会自动克隆仓库、安装 GBrain、配置大脑、加载 34 个技能、配置定时任务。你只需回答几个 API Key 问题，约 30 分钟完成。

### 命令行独立安装

```bash
git clone https://github.com/weiping/gbrain-cn.git && cd gbrain-cn && bun install && bun link
gbrain init                     # 本地大脑，2 秒就绪
gbrain import ~/notes/          # 索引你的 Markdown 笔记
gbrain query "我的笔记里有哪些反复出现的主题？"
```

**请勿使用 `bun install -g github:...`。** Bun 会阻断全局安装的顶级 postinstall 钩子，导致 schema 迁移无法运行，CLI 首次打开 PGLite 时会报 `Aborted()`。请使用上面的 `git clone + bun install && bun link`。

**请勿使用 `bun add -g gbrain` 或 `npm install -g gbrain`。** npm 注册表中存在一个占位的同名包（`gbrain@1.3.x`），会静默安装错误的二进制文件。

```
3 条结果（混合搜索，0.12s）：

1. concepts/do-things-that-dont-scale（分数：0.94）
   PG 关于不可扩展努力能让你了解用户真实需求的论点。
   [来源：paulgraham.com，2013-07-01]

2. originals/founder-mode-observation（分数：0.87）
   深度介入不是微管理，如果它扩展了团队的思维边界。

3. concepts/build-something-people-want（分数：0.81）
   YC 格言。已与大脑中的 12 个其他页面相连。
```

### MCP 服务器（Claude Code、Cursor、Windsurf）

GBrain 通过 stdio 暴露 30+ 个 MCP 工具：

```json
{
  "mcpServers": {
    "gbrain": { "command": "gbrain", "args": ["serve"] }
  }
}
```

添加到 `~/.claude/server.json`（Claude Code）、Settings > MCP Servers（Cursor），或你的客户端 MCP 配置中。

**使用智谱 AI 时的完整 MCP 配置：**

```json
{
  "mcpServers": {
    "gbrain": {
      "command": "gbrain",
      "args": ["serve"],
      "env": {
        "ZHIPU_API_KEY": "your_key",
        "EMBEDDING_MODEL": "zhipu:embedding-3",
        "EMBEDDING_DIMENSIONS": "1536",
        "EMBEDDING_BASE_URL": "https://open.bigmodel.cn/api/paas/v4",
        "CHAT_MODEL": "zhipu:glm-4.7"
      }
    }
  }
}
```

### 远程 MCP（带 OAuth 2.1，用于 ChatGPT、Claude Desktop、Perplexity）

`gbrain serve --http` 启动一个生产级 OAuth 2.1 服务器，内置管理控制台。无需外部基础设施。

```bash
# 启动 HTTP 服务器（首次启动时打印管理员引导 token）
gbrain serve --http --port 3131

# 打开管理控制台，粘贴引导 token，注册客户端
open http://localhost:3131/admin

# 公开暴露（设置 --public-url 使 OAuth issuer 匹配）
ngrok http 3131 --url your-brain.ngrok.app
gbrain serve --http --port 3131 --public-url https://your-brain.ngrok.app
```

### 与 GStack 配合使用

如果你的工程 Agent 运行在 [GStack](https://github.com/garrytan/gstack) 上，将其指向 gbrain 进行代码查找，而不是 grep + read。Cathedral II（v0.21.0）支持调用图边和两阶段检索：

```bash
gbrain code-callers searchKeyword           # 谁调用了这个函数？
gbrain code-callees searchKeyword           # 这个函数调用了什么？
gbrain code-def BrainEngine                 # X 在哪里定义？
gbrain code-refs BrainEngine                # 所有引用点
gbrain query "N+1 是如何处理的" --near-symbol BrainEngine.searchKeyword --walk-depth 2
```

---

## 34 个技能（Skills）

GBrain 附带 34 个技能，通过 `skills/RESOLVER.md`（或你的 OpenClaw 的 `AGENTS.md`，v0.19 起均支持）组织。Resolver 告诉 Agent 对任何任务读取哪个技能。

[技能文件就是代码。](https://x.com/garrytan/status/2042925773300908103) 技能文件是一个胖 Markdown 文档，编码了完整的工作流程：何时触发、检查什么、如何与其他技能链接、强制执行什么质量标准。精简运行时，胖技能：智能在技能中，不在运行时。

### 常驻技能（Always-on）

| 技能 | 功能 |
|---|---|
| **signal-detector** | 每条消息都触发。并行启动轻量模型捕获原创想法和实体提及。大脑自动复利。 |
| **brain-ops** | 任何外部 API 调用前先查大脑。让每个响应都更智能的读-丰富-写循环。 |

### 内容摄入

| 技能 | 功能 |
|---|---|
| **ingest** | 瘦路由器。检测输入类型并委托给正确的摄入技能。 |
| **idea-ingest** | 链接、文章、推文变成带分析、作者人物页和交叉链接的大脑页面。 |
| **media-ingest** | 视频、音频、PDF、书籍、截图、GitHub 仓库。转录、实体提取、反向链接传播。 |
| **meeting-ingestion** | 会议记录变成大脑页面。每个参与者都被丰富。每家公司都获得时间线条目。 |
| **voice-note-ingest** | 语音备注逐字捕获，保留原始措辞，绝不转述。根据内容路由到 originals/concepts/people 等目录。 |
| **article-enrichment** | 原始文章转储变成带执行摘要、逐字引用、关键洞察和意义分析的结构化页面。 |

### 研究与综合（v0.25.1）

| 技能 | 功能 |
|---|---|
| **book-mirror** | 旗舰技能。交给 Agent 一本书，获得个性化的双栏逐章分析。左栏保留章节实际内容；右栏用你大脑中你自己的文字将每个想法映射到你的生活。20 章书约 $6（Opus）。 |
| **strategic-reading** | 通过一个具体问题视角阅读书籍/文章/案例研究。输出：应用行动手册，含 做/避/观察 和短/中/长期建议。 |
| **concept-synthesis** | 将数千个概念草稿去重并整合为分层知识图谱（T1 典范到 T4 随想）。追踪想法多年间的演化。 |
| **perplexity-research** | 大脑增强的网络研究。将大脑上下文发送给 Perplexity，使搜索聚焦于新增内容（相对于已知内容）。输出：执行摘要 + 关键新进展 + 确认信号 + 矛盾或更新 + 推荐大脑更新 + 引用。 |
| **archive-crawler** | 个人文件存档的通用归档工具（Dropbox/Backblaze/Gmail 导出/硬盘存档）。**除非在 `gbrain.yml` 中设置 `archive-crawler.scan_paths:`，否则拒绝运行。** 默认安全。 |
| **academic-verify** | 从发表 → 方法论 → 原始数据 → 独立复现追踪研究主张。路由经过 perplexity-research；产出裁决（已验证/部分/不可验证/误归因/已撤稿）。 |
| **brain-pdf** | 通过 gstack `make-pdf` 二进制将任意大脑页面渲染为出版级 PDF。 |

### 大脑操作

| 技能 | 功能 |
|---|---|
| **enrich** | 分级丰富（T1/T2/T3）。创建和更新人物/公司页面，含编译真相和时间线。 |
| **query** | 三层搜索，含综合和引用。说"大脑没有关于 X 的信息"而非幻觉。 |
| **maintain** | 定期维护：过时页面、孤立页面、死链、引用审计、反向链接强制、标签一致性。v0.23 增加梦境周期的 synthesize + patterns 阶段——夜间会话转录变成反思、原创内容和 25 年模式。 |
| **citation-fixer** | 扫描缺失或格式错误的引用，修正为标准格式。 |
| **repo-architecture** | 新大脑文件放在哪里。决策协议：按主题确定目录，而非格式。 |
| **publish** | 将大脑页面分享为密码保护的 HTML。零 LLM 调用。 |
| **data-research** | 使用参数化 YAML 配方进行结构化数据研究。从邮件中提取投资者更新、支出、公司指标。 |

### 运营

| 技能 | 功能 |
|---|---|
| **daily-task-manager** | 任务生命周期管理，含优先级（P0-P3）。存储为可搜索的大脑页面。 |
| **daily-task-prep** | 晨会准备：日历前瞻，含每位参与者的大脑上下文、开放线程、任务回顾。 |
| **cron-scheduler** | 计划错开（5 分钟偏移），静默时段（时区感知，含唤醒覆盖），幂等性。 |
| **reports** | 带关键词路由的带时间戳报告。"最新简报是什么？"立即找到。 |
| **cross-modal-review** | 通过第二个模型进行质量关卡。拒绝路由：如果一个模型拒绝，静默切换。 |
| **webhook-transforms** | 外部事件（短信、会议、社交提及）转换为带实体提取的大脑页面。 |
| **testing** | 验证每个技能是否有 SKILL.md、manifest 覆盖、resolver 覆盖。 |
| **skill-creator** | 遵循合规标准创建新技能。对现有技能进行 MECE 检查。 |
| **skillify** | "skillify it!" 元技能。编排 10 步循环使故障成为持久技能。 |
| **skillpack-check** | Agent 可读的 gbrain 健康报告。CI 用退出码；调试用 JSON。 |
| **smoke-test** | 8 项重启后健康检查，含自动修复（Bun、CLI、DB、worker、Zod CJS、gateway、API Key、大脑仓库）。 |
| **minion-orchestrator** | 一个技能内的后台工作。Shell 任务通过 `gbrain jobs submit shell`，LLM 子 Agent 通过 `gbrain agent run`。支持父子 DAG、`child_done` 收件箱、跨 worker 重启的持久性。 |

### 身份与设置

| 技能 | 功能 |
|---|---|
| **soul-audit** | 6 阶段访谈，生成 SOUL.md（Agent 身份）、USER.md（用户档案）、ACCESS_POLICY.md（4 级隐私）、HEARTBEAT.md（运营节奏）。 |
| **setup** | 自动配置 PGLite 或 Supabase。首次导入。GStack 检测。 |
| **migrate** | 从 Obsidian、Notion、Logseq、Markdown、CSV、JSON、Roam 通用迁移。 |
| **briefing** | 带会议上下文、活跃交易和引用追踪的每日简报。 |

### 约定规范（跨技能）

`skills/conventions/` 中的跨切割规则：
- **quality.md** ... 引用、反向链接、显著性门槛、来源归因
- **brain-first.md** ... 任何外部 API 调用前的 5 步查询流程
- **model-routing.md** ... 哪个任务用哪个模型
- **test-before-bulk.md** ... 任何批量操作前先测试 3-5 个项目

---

## 工作原理

```
信号到达（会议、邮件、推文、链接）
  -> 信号检测器捕获想法 + 实体（并行，不阻塞）
  -> brain-ops：先查大脑（gbrain search, gbrain get）
  -> 携带完整上下文响应
  -> 写入：用新信息 + 引用更新大脑页面
  -> 自动链接：每次写入时零 LLM 调用提取类型化关系
  -> 同步：gbrain 为下次查询索引变更
```

每个周期都在累积知识。Agent 在会议后丰富一个人物页面。下次这个人出现时，Agent 已有上下文。差异每天复利。

系统自主变得更聪明。实体丰富自动升级：被提及一次的人获得 T3 草稿页面；跨不同来源被提及 3 次后，获得网络 + 社交丰富（T2）；会议后或 8 次以上提及后，进入完整管道（T1）。大脑在没有指示的情况下学会谁重要。

> "帮我准备 30 分钟后与张三的会议"
> ... 拉取档案、共同历史、最近动态、开放线程

> "我对创始人绩效与压力之间关系说过什么？"
> ... 搜索你自己的想法，而不是互联网

---

## Minions：你的子 Agent 不再丢失任务

内置大脑的持久化 Postgres 原生任务队列。每个长期运行的 Agent 任务现在都是一个任务，能够在 gateway 重启中存活、流式传输进度、中途暂停/恢复/调整，并在 `gbrain jobs list` 中显示。除了现有大脑，无需任何基础设施。

### 关键数据

一台 Render 容器，Supabase Postgres 持有 45,000 页的大脑，19 个 cron 任务按计划运行。任务：从外部 API 拉取一个月的社交帖子并端到端摄入到大脑。

|              | Minions   | `sessions_spawn`               |
|---|---|---|
| 耗时         | **753ms** | **>10,000ms**（gateway 超时） |
| Token 费用   | **$0.00** | 每次约 $0.03                  |
| 成功率       | **100%**  | **0%**（连启动都不行）         |
| 内存/任务    | ~2 MB     | ~80 MB                        |

Minions 不是比子 Agent 稍好一点。它是质的不同。

### 路由规则

> **确定性**（相同输入 → 相同步骤 → 相同输出）→ **Minions**
> **判断**（输入需要评估或决策）→ **子 Agent**

拉取帖子、解析 JSON、写大脑页面、运行同步——确定性的，$0 Token，能存活重启，毫秒运行。处理收件箱优先级、评估会议重要性——判断。这才是子 Agent 真正擅长的。

### 健康检查与自愈

```bash
gbrain jobs smoke                        # 验证安装
gbrain jobs submit sync --params '{}'    # 提交后台任务
gbrain jobs stats                        # 健康仪表盘
gbrain jobs supervisor --concurrency 4   # 带崩溃恢复的 worker（仅 Postgres）
```

详细指南：[`skills/minion-orchestrator/SKILL.md`](skills/minion-orchestrator/SKILL.md)

---

## 持久化 Agent：`gbrain agent`（v0.15）

你的子 Agent 运行现在能从崩溃中恢复。OpenClaw 在运行中途宕机？Worker 重启后从最后提交的轮次继续执行。

```bash
# 提交单个子 Agent 运行
gbrain agent run "总结我最近的 10 个日记页面"

# 将 N 个提示扇出到 N 个子 Agent + 1 个聚合器
gbrain agent run "分析每一页" \
  --fanout-manifest manifests/pages.json \
  --subagent-def analyzer

# 跟踪运行中的任务
gbrain agent logs 1247 --follow --since 5m
```

---

## Skillify：说"skillify it!"，让错误在结构上不可能再现

你的 OpenClaw 遇到了新故障。你在对话中修复了它。你说 "skillify it!"。现在修复是永久的：一个带触发器的 SKILL.md、一个带测试的确定性脚本、Agent 每天重新评估的路由 fixture、防止输出漂移的归档审计。10 个项目，每个都是必要的。

### 四个核心命令（v0.19）

```bash
# 1. 一次性为新技能创建所有 5 个存根文件
gbrain skillify scaffold webhook-verify \
  --description "verify ngrok webhooks" \
  --triggers "verify the webhook,check tunnel"

# 2. 10 项审计：SKILL.md、脚本、单元 + E2E 测试、LLM 评估、
#    resolver 条目、触发器评估、check-resolvable 关卡、大脑归档
gbrain skillify check skills/webhook-verify/scripts/webhook-verify.mjs

# 3. 验证整个树：可达性、MECE 重叠、DRY、路由缺口、归档审计
gbrain check-resolvable              # 警告仅通知，错误阻断
gbrain check-resolvable --strict     # 警告也阻断（CI 选项）
```

### `gbrain skillpack install` — 将 25 个精选技能安装到你的 OpenClaw

```bash
gbrain skillpack list                          # 25 个精选技能
gbrain skillpack install brain-ops             # 一个技能 + 共享约定
gbrain skillpack install --all                 # 完整套件
gbrain skillpack diff brain-ops                # 对比套件与本地副本
```

---

## 存储分层（v0.22.11）

当你的大脑跨越 10 万文件，声明哪些目录属于 git，哪些只在数据库中：

```yaml
# 大脑仓库根目录的 gbrain.yml
storage:
  db_tracked:
    - people/
    - companies/
    - deals/
  db_only:
    - media/x/
    - media/articles/
    - meetings/transcripts/
```

`gbrain sync` 自动管理 `db_only` 路径的 `.gitignore`。`gbrain storage status` 显示分层明细。

---

## 数据摄入

GBrain 附带集成配方，让你的 Agent 为你配置：

| 配方 | 需要 | 功能 |
|---|---|---|
| [公网隧道](recipes/ngrok-tunnel.md) | — | MCP + 语音的固定 URL（ngrok Hobby $8/月） |
| [凭证网关](recipes/credential-gateway.md) | — | Gmail + Calendar 访问 |
| [语音转大脑](recipes/twilio-voice-brain.md) | ngrok-tunnel | 电话通话转大脑页面 |
| [邮件转大脑](recipes/email-to-brain.md) | credential-gateway | Gmail 转实体页面 |
| [X 转大脑](recipes/x-to-brain.md) | — | Twitter 时间线 + 提及 |
| [日历转大脑](recipes/calendar-to-brain.md) | credential-gateway | Google Calendar 转可搜索日页面 |
| [会议同步](recipes/meeting-sync.md) | — | Circleback 转录转带参与者的大脑页面 |

运行 `gbrain integrations` 查看状态。

---

## GBrain + GStack

[GStack](https://github.com/garrytan/gstack) 是引擎。GBrain 是 mod。

- **GStack** = 编程技能（ship、review、QA、investigate、office-hours、retro）
- **GBrain** = 其余一切技能（大脑操作、信号检测、摄入、丰富、cron、报告、身份）
- **`hosts/gbrain.ts`** = 桥梁，告诉 GStack 编程技能在编程前先查大脑

---

## 架构

```
┌──────────────────┐    ┌───────────────┐    ┌──────────────────┐
│    大脑仓库      │    │    GBrain     │    │    AI Agent      │
│    (git)         │    │  （检索层）   │    │  （读/写）       │
│                  │    │               │    │                  │
│  markdown 文件  │───>│  Postgres +   │<──>│  34 个技能       │
│  = 事实来源     │    │  pgvector     │    │  定义如何使用    │
│                  │    │               │    │  大脑            │
│  人类可读写     │<───│  混合搜索     │    │  RESOLVER.md     │
│                  │    │  （向量 +     │    │  将意图路由到    │
│                  │    │   关键词 +    │    │  技能            │
│                  │    │   RRF）       │    │                  │
└──────────────────┘    └───────────────┘    └──────────────────┘
```

仓库是事实来源。GBrain 是检索层。Agent 通过两者读写。人类永远是最终权威——编辑任何 Markdown 文件，`gbrain sync` 会感知变更。

**智谱 AI 数据流：**

```
笔记文件 → gbrain sync → 分块（Chunker）
                               |
                    智谱 embedding-3 API
                               |
                     向量存入 PGLite/Postgres
                               |
查询 → glm-4.7 扩展查询 → 混合检索（向量 + 关键词 + RRF 排名）
```

---

## 知识模型

每个页面遵循"编译真相 + 时间线"模式：

```markdown
---
type: concept
title: 做不可扩展的事
tags: [startups, growth, pg-essay]
---

Paul Graham 关于创业公司应该早期做不可扩展的事的论点。
核心洞察：不可扩展的努力教会你用户真正想要什么，
这是你用其他方式无法学到的。

---

- 2013-07-01：发表于 paulgraham.com
- 2024-11-15：在 W25 批次启动演讲中被引用
```

`---` 以上：**编译真相**。你当前最佳理解，新证据出现时重写。以下：**时间线**。仅追加的证据轨迹，永不编辑，只增加。

---

## 知识图谱

页面不只是文本。每次提及人、公司或概念都会成为结构化图谱中的类型化链接。大脑自动布线。

```
写一个提及张三和某 AI 公司的会议页面
  -> 自动链接从内容中提取实体引用（零 LLM 调用）
  -> 推断类型：会议页 + 人物引用 => `attended`
              "X 的 CEO" 模式  => `works_at`
              "invested in"    => `invested_in`
              "advises"        => `advises`
              "founded"        => `founded`
  -> 协调过时链接：编辑时删除内容中不再存在的链接
  -> 反向链接为连接良好的实体在搜索中排名更高
```

```bash
gbrain graph-query people/alice --type attended --depth 2
# 返回 Alice 参与过的会议，递归展开
```

图谱支持向量搜索无法回答的问题。为现有大脑批量补充：

```bash
gbrain extract links --source db        # 连线现有的 1000+ 页面
gbrain extract timeline --source db     # 从 Markdown 时间线提取日期事件
```

---

## 搜索

混合搜索：向量 + 关键词 + RRF 融合 + 多查询扩展 + 4 层去重。

```
查询
  -> 意图分类器（实体？时序？事件？通用？）
  -> 多查询扩展（Claude Haiku / glm-4.7 将问题改写为 3 种形式）
  -> 向量搜索（HNSW 余弦）+ 关键词搜索（tsvector）
  -> RRF 融合：分数 = sum(1/(60 + 排名))
  -> 余弦重排序 + 编译真相加权
  -> 4 层去重 + 编译真相保证
  -> 结果
```

CJK 特有增强：
- **双字切分器**：中文文本被切分为双字（bigram）供 tsvector 索引，无需外部依赖
- **向量兜底**：`[[中文标题]]` Wikilink 精确匹配失败时，自动降级为向量相似度搜索

---

## 综合原理：多策略协同

大脑不是一个技巧。每个检索问题都经过约 20 个确定性技术的层层叠加。没有哪一个是魔法；胜利来自堆叠，使每层覆盖其他层的盲区。

基准测试结果（BrainBench v1 语料库，240 页富文本，PR #188 前后）：

| 指标                  | 之前   | 之后      | Δ           |
|---|---|---|---|
| **Precision@5**       | 39.2%  | **44.7%** | **+5.4 pts** |
| **Recall@5**          | 83.1%  | **94.6%** | **+11.5 pts** |
| top-5 命中数          | 217    | 247       | **+30**      |
| 图谱专项 F1（消融实验）| 57.8%  | **86.6%** | **+28.8 pts** |

完整报告：[gbrain-evals](https://github.com/garrytan/gbrain-evals)。

---

## 语音

拨打一个电话号码。你的 AI 接听。它知道谁在打来，从大脑中拉取完整上下文，并像真正了解你的世界的人一样响应。通话结束时，一个大脑页面出现，包含转录、实体检测和交叉引用。

语音配方随 GBrain 附带：[Voice-to-Brain](recipes/twilio-voice-brain.md)。WebRTC 在浏览器标签页中零配置工作。真实电话号码是可选的。

---

## 引擎架构

```
CLI / MCP Server（薄封装，操作完全一致）
              |
     BrainEngine 接口（可插拔）
              |
     +--------+--------+
     |                  |
PGLiteEngine       PostgresEngine
  （默认）            （Supabase）
     |                  |
~/.gbrain/           Supabase Pro（$25/月）
brain.pglite         Postgres + pgvector
嵌入式 PG 17.5

     gbrain migrate --to supabase|pglite
         （双向迁移）
```

PGLite：嵌入式 Postgres，无服务器，零配置。当你的大脑超出本地容量（1000+ 文件、多设备），`gbrain migrate --to supabase` 迁移所有内容。

---

## 文件存储

大脑仓库会积累二进制文件。GBrain 有三阶段迁移方案：

```bash
gbrain files mirror <dir>       # 复制到云端，本地不变
gbrain files redirect <dir>     # 将本地替换为 .redirect 指针
gbrain files clean <dir>        # 删除指针，仅云端保留
gbrain files restore <dir>      # 下载所有内容回来（撤销）
```

存储后端：S3 兼容（AWS、R2、MinIO）、Supabase Storage、本地。

---

## 命令参考

```
设置
  gbrain init [--supabase|--url]        创建大脑（默认 PGLite）
  gbrain migrate --to supabase|pglite   双向引擎迁移
  gbrain upgrade                        自更新含功能发现

页面
  gbrain get <slug>                     读取页面（模糊 slug 匹配）
  gbrain put <slug> [< file.md]         写入/更新（自动版本化）
  gbrain delete <slug>                  删除页面
  gbrain list [--type T] [--tag T]      带过滤器列出

搜索
  gbrain search <query>                 关键词搜索（tsvector）
  gbrain query <question>              混合搜索（向量 + 关键词 + RRF）

导入
  gbrain import <dir> [--no-embed] [--workers N]
                                        导入 Markdown（幂等）
  gbrain sync [--repo <path>] [--workers N]
                                        Git 到大脑的增量同步
  gbrain export [--dir ./out/]          导出为 Markdown

嵌入
  gbrain embed [<slug>|--all|--stale]   生成/刷新向量嵌入

链接 + 图谱
  gbrain link|unlink|backlinks          交叉引用管理
  gbrain extract links|timeline|all    批量从现有页面回填
  gbrain graph-query <slug>             类型化遍历（--type T --depth N）

后台任务（Minions）
  gbrain jobs submit <name> [--params JSON] [--follow]  提交后台任务
  gbrain jobs list [--status S] [--queue Q]             列出任务
  gbrain jobs get|cancel|retry|delete <id>              管理任务生命周期
  gbrain jobs prune [--older-than 30d]                  清理已完成/死亡任务
  gbrain jobs stats                                     任务健康仪表盘
  gbrain jobs smoke                                     一条命令健康检查
  gbrain jobs work [--queue Q] [--concurrency N]        启动 worker 守护进程

技能（v0.19）
  gbrain skillify scaffold <name>       创建 5 个存根文件 + 幂等 resolver 行
  gbrain skillify check [path]          10 项技能审计
  gbrain skillpack list                 列出套件中的 25 个精选技能
  gbrain skillpack install <name>       安装一个技能 + 共享约定
  gbrain skillpack install --all        安装完整精选套件
  gbrain check-resolvable [--strict]    Resolver 审计（可达性、MECE、DRY、路由、归档）
  gbrain routing-eval [--llm] [--json]  意图→技能路由准确性测试

评估
  gbrain eval --qrels <path>            传统 IR 评估（P@k, R@k, MRR, nDCG@k）
  gbrain eval export [--since DUR]      流式导出捕获的 eval_candidates 为 NDJSON
  gbrain eval prune --older-than DUR    清理 eval_candidates 保留窗口
  gbrain eval replay --against FILE     重放捕获查询对比当前构建
  gbrain eval longmemeval <dataset>     运行公开 LongMemEval 基准测试（v0.28.8）

管理
  gbrain doctor [--json] [--fast]       健康检查（resolver、技能、DB、嵌入）
  gbrain doctor --fix [--dry-run]       自动修复 DRY 违规
  gbrain stats                          大脑统计
  gbrain serve                          MCP 服务器（stdio）
  gbrain serve --http [--port 3131]     带 OAuth 2.1 + 管理控制台的 HTTP MCP 服务器
  gbrain auth create|list|revoke|test   遗留 Bearer Token 管理
  gbrain auth register-client <name>    注册 OAuth 2.1 客户端
  gbrain integrations                   集成配方仪表盘
  gbrain sources list|add|remove|...    多源大脑管理（v0.18）
  gbrain dream [--dry-run] [--phase N]  8 阶段维护周期
  gbrain orphans [--json] [--count]     查找无入链的孤立页面
```

运行 `gbrain --help` 获取完整参考。

---

## 起源故事

我在配置我的 [OpenClaw](https://openclaw.ai) Agent 时，开始了一个 Markdown 大脑仓库。每个人一页，每家公司一页，编译真相在上，时间线在下。一周内：10,000+ 文件，3,000+ 人，13 年日历数据，280+ 会议转录，300+ 捕获的想法。

Agent 在我睡觉时运行。梦境周期扫描每段对话，丰富缺失的实体，修正损坏的引用，整合记忆。我醒来时，大脑比我入睡时更聪明。

这个仓库中的技能是这些模式的通用化。那些手工花了 11 天建立的东西，现在以 30 分钟内可安装的 mod 形式交付。

---

## 文档

**供 Agent 使用：**
- **[skills/RESOLVER.md](skills/RESOLVER.md)** ... 从这里开始。技能调度器。
- [各技能文件](skills/) ... 28 个独立指令集（25 个在精选套件中）
- [Getting Data In](docs/integrations/README.md) ... 集成配方和数据流

**供人类使用：**
- [GBRAIN_RECOMMENDED_SCHEMA.md](docs/GBRAIN_RECOMMENDED_SCHEMA.md) ... 大脑仓库目录结构
- [Thin Harness, Fat Skills](docs/ethos/THIN_HARNESS_FAT_SKILLS.md) ... 架构哲学
- [ENGINES.md](docs/ENGINES.md) ... 可插拔引擎接口

**gbrain-cn 专属：**
- [智谱 AI 配置指南](docs/guides/zhipu-ai-setup.md)
- [嵌入维度选择](docs/guides/zhipu-ai-dimensions.md)
- [CJK 搜索增强](docs/cjk-enhancement.md)

**参考：**
- [CHANGELOG.md](CHANGELOG.md) ... 版本历史
- [gbrain-evals](https://github.com/garrytan/gbrain-evals) ... BrainBench 基准测试

---

## 贡献

运行 `bun run test` 进行并行单元测试快速循环（Mac 开发机约 85s，3700+ 测试），或 `bun run verify` 进行推送前检查。完整本地 CI 关卡（gitleaks + 单元 + 所有 29 个 E2E 文件，在 Docker 中）：`bun run ci:local`。

如果你在处理检索或搜索/嵌入/排名相关功能，在你的 shell rc 中设置 `GBRAIN_CONTRIBUTOR_MODE=1` 并使用 `gbrain eval replay` 将你的变更与真实捕获查询的快照进行对比。

欢迎 PR：新的丰富 API、性能优化、额外引擎后端、遵循 `skills/skill-creator/SKILL.md` 合规标准的新技能。

---

## 许可证

MIT — 与上游 [garrytan/gbrain](https://github.com/garrytan/gbrain) 相同。

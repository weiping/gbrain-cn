# GBrain（中文版）

[English](README.md) | 中文

> **gbrain-cn** 分支：在上游 gbrain 基础上增加了国产 AI 提供商（智谱 AI）支持与中日韩（CJK）全文搜索。

你的 AI Agent 聪明但健忘。GBrain 给它一个大脑。

基于向量检索 + 知识图谱 + 结构化时间线的混合搜索引擎，让 Agent 能够回答 "谁在某公司工作？"、"某人这季度投了什么？" 这类纯向量搜索无法回答的问题。P@5 49.1%，R@5 97.9%，在 240 页富文本语料库上优于 ripgrep-BM25 + 纯向量 RAG。

**39 个技能（Skills）。30 分钟完成安装。Agent 自动完成其余工作。**

---

## gbrain-cn 新增特性

| 特性 | 说明 |
|---|---|
| **智谱 AI** | `embedding-3`（1024 / 1536 / 2048 维），`glm-4.7` 用于聊天与查询扩展 |
| **CJK 搜索** | 内置双字切分器，无需外部依赖，PGLite + Postgres 均支持 |
| **Nodejieba（可选）** | 启用 `GBRAIN_USE_NODEJIEBA=1` 后升级为专业中文分词 |
| **中文 Wikilink 解析** | `[[中文标题]]` 通过向量搜索兜底，精确匹配失败时自动降级 |
| **可变嵌入维度** | `embedding-3` 支持 1024 / 1536 / 2048 维，通过 `EMBEDDING_DIMENSIONS` 配置 |

---

## 快速开始

### 1. 安装

```bash
git clone https://github.com/weiping/gbrain-cn.git
cd gbrain-cn
bun install
bun link
```

### 2. 配置智谱 AI

在 `~/.zshrc`（或 `~/.bashrc`）中添加：

```bash
export ZHIPU_API_KEY="your_api_key_here"
export EMBEDDING_MODEL="zhipu:embedding-3"
export EMBEDDING_DIMENSIONS="1536"
export EMBEDDING_BASE_URL="https://open.bigmodel.cn/api/paas/v4"
export CHAT_MODEL="zhipu:glm-4.7"
export EXPANSION_MODEL="zhipu:glm-4.7"
```

获取 API Key：[open.bigmodel.cn/usercenter/apikeys](https://open.bigmodel.cn/usercenter/apikeys)

### 3. 初始化大脑

```bash
source ~/.zshrc
gbrain init          # 本地 PGLite，2 秒就绪，无需服务器
```

### 4. 同步笔记库

```bash
gbrain sync --repo ~/your-vault    # 同步你的 Markdown 笔记
gbrain embed --stale               # 生成向量嵌入
gbrain doctor                      # 检查健康状态
```

### 5. 开始查询

```bash
gbrain query "哪些笔记提到了 RAG 架构？"
gbrain query "我和张三都参加了哪些会议？"
```

---

## 嵌入维度说明

`embedding-3` 支持三种维度，各有取舍：

| 维度 | 精度 | 存储/检索速度 | 推荐场景 |
|---|---|---|---|
| `1024` | 良好 | 最快 | 大规模语料（>5 万页），资源受限 |
| `1536` | 优秀 | 中等 | **推荐默认值**，与 OpenAI ada-002 兼容 |
| `2048` | 最佳 | 较慢 | 高精度需求，语料规模适中 |

**注意**：切换维度需要重建所有向量。

```bash
# 切换维度前备份
cp -r ~/.gbrain/brain.pglite ~/.gbrain/brain.pglite.bak

# 修改环境变量后重新嵌入
export EMBEDDING_DIMENSIONS="2048"
gbrain embed --all
```

详细说明：[docs/guides/zhipu-ai-dimensions.md](docs/guides/zhipu-ai-dimensions.md)

---

## CJK 搜索

### 内置双字切分（默认，无需配置）

gbrain-cn 默认使用**双字（bigram）切分器**处理中日韩文本：

- "人工智能" → ["人工", "工智", "智能"]
- 无外部依赖，PGLite + Postgres 均支持
- 适合日常中文知识库

### Nodejieba 增强（可选）

对于含大量专业术语、新词的语料，可启用 nodejieba：

```bash
pnpm add nodejieba
export GBRAIN_USE_NODEJIEBA=1
```

| 对比项 | 双字切分 | Nodejieba |
|---|---|---|
| 外部依赖 | 无 | nodejieba |
| 安装速度 | 快 | 慢（编译原生模块） |
| 分词质量 | ⭐⭐⭐ 良好 | ⭐⭐⭐⭐⭐ 专业级 |
| 适用场景 | 日常笔记 | 技术文档、学术资料 |

详细说明：[docs/cjk-enhancement.md](docs/cjk-enhancement.md)

---

## MCP 服务器（Claude Code / Cursor / Windsurf）

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

---

## 健康检查

```bash
gbrain doctor
```

正常输出应包含：

```
[OK] embedding_provider: zhipu:embedding-3 ✓ <500ms, 1536 dims, DB aligned
[OK] embeddings: 100% coverage, 0 missing
[OK] brain_score: Brain score 99/100
Health score: 90/100
```

---

## 命令速查

```bash
# 初始化
gbrain init                          # 初始化本地 PGLite 大脑

# 数据摄入
gbrain sync --repo ~/vault           # 同步 Markdown 笔记库
gbrain import ~/notes/               # 单次导入目录
gbrain embed --stale                 # 嵌入未处理的 chunks

# 查询
gbrain query "你的问题"              # 混合搜索（向量 + 关键词）
gbrain search "关键词"               # 纯关键词搜索
gbrain graph-query <slug> --depth 2  # 知识图谱查询

# 维护
gbrain doctor                        # 健康检查
gbrain extract links                 # 提取反向链接
gbrain extract timeline              # 提取时间线条目
gbrain orphans                       # 查找孤立页面

# 导出
gbrain serve                         # 启动 MCP stdio 服务器
```

---

## 架构

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
~/.gbrain/           Supabase Pro
brain.pglite         Postgres + pgvector
嵌入式 PG 17.5

     gbrain migrate --to supabase|pglite
         （双向迁移）
```

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

## 文档

- [智谱 AI 配置指南](docs/guides/zhipu-ai-setup.md)
- [嵌入维度选择](docs/guides/zhipu-ai-dimensions.md)
- [CJK 搜索增强](docs/cjk-enhancement.md)
- [技能列表（RESOLVER.md）](skills/RESOLVER.md)
- [上游 gbrain（英文）](README.md)
- [上游仓库](https://github.com/garrytan/gbrain)

---

## 许可证

MIT — 与上游 [garrytan/gbrain](https://github.com/garrytan/gbrain) 相同。

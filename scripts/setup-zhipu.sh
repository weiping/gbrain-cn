#!/bin/bash
# Zhipu AI 快速配置脚本
# 使用方法: bash scripts/setup-zhipu.sh YOUR_API_KEY

set -e

if [ -z "$1" ]; then
  echo "用法: $0 YOUR_ZHIPU_API_KEY"
  echo "示例: $0 d8e72d7cc79c4f1f9ee1edc8bd33a341.zCXSMTBJoj2TDbSo"
  exit 1
fi

API_KEY="$1"

echo "📝 配置 Zhipu AI..."
echo ""

# 检测 shell 配置文件
SHELL_CONFIG=""
if [ -n "$ZSH_VERSION" ] || [ -f "$HOME/.zshrc" ]; then
  SHELL_CONFIG="$HOME/.zshrc"
elif [ -n "$BASH_VERSION" ] || [ -f "$HOME/.bashrc" ]; then
  SHELL_CONFIG="$HOME/.bashrc"
else
  echo "❌ 无法检测到 shell 配置文件"
  exit 1
fi

echo "🔧 添加环境变量到 $SHELL_CONFIG..."

# 备份配置文件
cp "$SHELL_CONFIG" "${SHELL_CONFIG}.backup.$(date +%s)"

# 添加环境变量（如果尚未添加）
if ! grep -q "ZHIPU_API_KEY" "$SHELL_CONFIG"; then
  cat >> "$SHELL_CONFIG" << 'EOF'

# Zhipu AI (智谱 AI) 配置
export ZHIPU_API_KEY="YOUR_API_KEY_PLACEHOLDER"
export EMBEDDING_MODEL="zhipu:embedding-3"
export EMBEDDING_DIMENSIONS="1536"  # ⚠️ 注意：Zhipu 实际返回 1024 维，建议改为 1024
export EMBEDDING_BASE_URL="https://open.bigmodel.cn/api/paas/v4"
export CHAT_MODEL="zhipu:glm-4.7"
export EXPANSION_MODEL="zhipu:glm-4.7"
EOF
  # 替换占位符为实际 API key
  sed -i '' "s/YOUR_API_KEY_PLACEHOLDER/$API_KEY/" "$SHELL_CONFIG"
  echo "✅ 环境变量已添加到 $SHELL_CONFIG"
else
  echo "⚠️  环境变量已存在，跳过添加"
  # 更新现有的 API key
  sed -i '' "s/export ZHIPU_API_KEY=.*/export ZHIPU_API_KEY=\"$API_KEY\"/" "$SHELL_CONFIG"
  echo "✅ 已更新 ZHIPU_API_KEY"
fi

echo ""
echo "🔄 重新加载配置..."
# 导出环境变量到当前会话
export ZHIPU_API_KEY="$API_KEY"
export EMBEDDING_MODEL="zhipu:embedding-3"
export EMBEDDING_DIMENSIONS="1536"
export EMBEDDING_BASE_URL="https://open.bigmodel.cn/api/paas/v4"
export CHAT_MODEL="zhipu:glm-4.7"
export EXPANSION_MODEL="zhipu:glm-4.7"

echo "✅ 配置完成！"
echo ""
echo "⚠️  重要警告："
echo "   Zhipu embedding-3 实际返回 1024 维向量"
echo "   配置为 1536 维会导致维度不匹配错误"
echo "   建议修改为 1024 或使用 OpenAI 获得真正的 1536 维"
echo ""
echo "📋 当前配置："
echo "   API Key: ${API_KEY:0:20}..."
echo "   嵌入模型: zhipu:embedding-3"
echo "   配置维度: 1536 ⚠️"
echo "   实际维度: 1024 (API返回)"
echo "   聊天模型: zhipu:glm-4.7"
echo "   扩展模型: zhipu:glm-4.7"
echo ""
echo "🚀 下一步："
echo "   1. 重新打开终端或运行: source $SHELL_CONFIG"
echo "   2. 如果已有数据库，运行迁移: gbrain migrate --embedding-model zhipu:embedding-3 --embedding-dimensions 1024"
echo "   3. 重新嵌入所有页面: gbrain embed --all"
echo ""
echo "📖 完整文档: docs/guides/zhipu-ai-setup.md"

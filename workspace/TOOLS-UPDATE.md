# 工具更新通知 - 2026-02-03

## Parallel Search 已配置

团队现在可以使用 `@rikalabs/parallel` 进行网络调研。

### 使用方法

```bash
npx @rikalabs/parallel search --query "搜索内容" --max-results 5 --format json
```

### 示例

```bash
# 技术对比
npx @rikalabs/parallel search --query "STM32 vs ESP32 机器人开发 2024" --max-results 5 --format json

# 竞品分析  
npx @rikalabs/parallel search --query "情感机器人 市场 竞品" --max-results 8 --format json

# 网页内容提取
npx @rikalabs/parallel extract --url "https://example.com" --objective "提取关键信息" --format json
```

### 参数

| 参数 | 说明 |
|------|------|
| `--query` | 搜索关键词 (必填) |
| `--max-results` | 结果数量 (默认5) |
| `--format` | json 或 text |
| `--mode` | one-shot 或 agentic |

### 注意

- 优先使用此工具而非内置 web_search
- 返回 JSON 格式便于处理
- 已配置 API key，直接使用即可

---
*由 Nova 配置于 2026-02-03 09:31 UTC*

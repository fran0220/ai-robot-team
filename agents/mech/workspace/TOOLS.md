# TOOLS.md - Mech 工具配置

## Zoo Text-to-CAD API ✅ 已验证

环境变量：`$ZOO_API_KEY`

---

## 🔧 生成 CAD 文件（异步流程）

### Step 1: 提交任务

```bash
RESPONSE=$(curl -s -X POST "https://api.zoo.dev/ai/text-to-cad/step" \
  -H "Authorization: Bearer $ZOO_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "YOUR_PROMPT"}')

TASK_ID=$(echo "$RESPONSE" | jq -r '.id')
echo "Task ID: $TASK_ID"
```

### Step 2: 轮询状态

```bash
# 等待 30-90 秒
sleep 30

RESULT=$(curl -s "https://api.zoo.dev/user/text-to-cad/$TASK_ID" \
  -H "Authorization: Bearer $ZOO_API_KEY")

STATUS=$(echo "$RESULT" | jq -r '.status')
echo "Status: $STATUS"
```

### Step 3: 下载文件

```bash
# 当 status = "completed" 时
echo "$RESULT" | jq -r '.outputs["source.step"]' | base64 -d > output.step
```

### 完整脚本

```bash
#!/bin/bash
# generate-cad.sh <prompt> <output_file>

PROMPT="$1"
OUTPUT="${2:-output.step}"

echo "🔧 提交任务..."
RESPONSE=$(curl -s -X POST "https://api.zoo.dev/ai/text-to-cad/step" \
  -H "Authorization: Bearer $ZOO_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"prompt\": \"$PROMPT\"}")

TASK_ID=$(echo "$RESPONSE" | jq -r '.id')
echo "Task ID: $TASK_ID"

echo "⏳ 等待生成..."
for i in {1..12}; do
  sleep 10
  RESULT=$(curl -s "https://api.zoo.dev/user/text-to-cad/$TASK_ID" \
    -H "Authorization: Bearer $ZOO_API_KEY")
  STATUS=$(echo "$RESULT" | jq -r '.status')
  echo "  Status: $STATUS"
  
  if [ "$STATUS" = "completed" ]; then
    echo "✅ 下载文件..."
    echo "$RESULT" | jq -r '.outputs["source.step"]' | base64 -d > "$OUTPUT"
    echo "保存到: $OUTPUT ($(wc -c < "$OUTPUT") bytes)"
    exit 0
  elif [ "$STATUS" = "failed" ]; then
    echo "❌ 生成失败"
    exit 1
  fi
done

echo "⚠️ 超时"
exit 1
```

---

## 📝 Prompt 模板

### 支架/Bracket
```
[类型] bracket, [长]mm x [宽]mm x [厚]mm,
[数量]x [规格] mounting holes on [间距] pattern,
[特征描述]
```

### 外壳/Housing
```
[形状] enclosure, [外尺寸],
wall thickness [壁厚]mm,
[开口/孔位], [装配特征]
```

---

## 📊 输出格式

| 格式 | Endpoint | 用途 |
|------|----------|------|
| STEP | `/ai/text-to-cad/step` | 量产、CNC |
| STL | `/ai/text-to-cad/stl` | 3D打印 |
| OBJ | `/ai/text-to-cad/obj` | 渲染 |

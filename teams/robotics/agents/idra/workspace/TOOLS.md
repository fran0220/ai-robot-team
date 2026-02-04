# TOOLS.md - Idra 工具配置

## 图像生成 API

环境变量：`$GEMINI_API_KEY` ✅ 已配置

---

## 🎨 默认模型：Imagen 3 Pro (高质量)

**推荐用于正式设计输出**

```bash
# Imagen 3 生成高质量图片
curl -s "https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=$GEMINI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "instances": [{"prompt": "YOUR_PROMPT_HERE"}],
    "parameters": {
      "sampleCount": 1,
      "aspectRatio": "1:1",
      "personGeneration": "allow_adult"
    }
  }' | jq -r '.predictions[0].bytesBase64Encoded' | base64 -d > output.png
```

**参数说明**：
- `sampleCount`: 生成数量 (1-4)
- `aspectRatio`: 比例 ("1:1", "16:9", "9:16", "4:3", "3:4")
- `personGeneration`: "allow_adult" / "dont_allow"

---

## ⚡ 备用模型：Gemini 2.0 Flash (快速)

**用于快速原型/测试**

```bash
# Gemini Flash 快速生成
curl -s "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=$GEMINI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{"parts": [{"text": "Generate an image: YOUR_PROMPT"}]}],
    "generationConfig": {"responseModalities": ["image", "text"]}
  }' | jq -r '.candidates[0].content.parts[] | select(.inlineData) | .inlineData.data' | base64 -d > output.png
```

---

## 📝 使用规范

1. **正式设计** → 使用 Imagen 3 Pro
2. **快速测试** → 使用 Gemini Flash
3. **输出目录** → `designs/` (已链接共享目录)

---

## 🎯 Prompt 模板

### 产品概念图
```
Professional product render of [产品描述].
Industrial design style, studio lighting, white background.
[材质]: matte/glossy plastic, brushed aluminum, soft-touch rubber.
[视角]: 3/4 view, front view, isometric.
High quality, photorealistic, 4K resolution.
```

### CMF 方案
```
Product color/material variations of [产品]:
Show 4 variants in grid: [色1], [色2], [色3], [色4].
Same angle, white background, professional lighting.
Materials: [材质描述].
```

### 场景效果图
```
Lifestyle product photography of [产品] in [场景].
[用户] interacting with the product.
Natural lighting, warm atmosphere, editorial style.
```

---

## 🎨 设计词汇速查

**风格**: modern, minimalist, kawaii, industrial, organic, futuristic, Scandinavian
**材质**: matte plastic, glossy, brushed metal, soft-touch, fabric, wood grain
**配色**: Arctic White, Space Gray, Rose Gold, Midnight Blue, Coral, Sage Green
**视角**: front, side, top, 3/4, isometric, bird's eye, hero shot

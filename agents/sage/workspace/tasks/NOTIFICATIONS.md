# NOTIFICATIONS.md

## 2025-02-03 紧急任务分配

### 📢 @jarvis @sage @friday 

**【P0紧急】投资人尽调准备 - 截止2月4日晚**

后天(2月5日)我们要接受投资机构的尽职调查，需要准备硬件技术问答材料。

---

### @jarvis - 硬件架构与选型问答
任务ID: `js7218jvqytdmbpt0xe88hd9ws80et2k`

准备以下问题的专业回答：
1. 为什么选择RK3587？备选方案？
2. 双机协同架构的合理性
3. 机械臂精度如何保证？
4. BOM成本估算
5. 供应链风险与备选
6. 量产可行性评估

**输出**：`workspace/docs/DD-硬件架构问答.md`

---

### @sage - 竞品硬件方案对比
任务ID: `js71mzmm25bw28xvtg8nrbr96180e5w6`

调研市场竞品：
1. 围棋机器人竞品有哪些？
2. 他们的硬件方案？
3. 我们的技术差异化？
4. 成本优势/劣势分析

**输出**：`workspace/docs/DD-竞品硬件对比.md`

---

### @friday - 软硬件协同与算法可行性
任务ID: `js70mezag89h6z7mztvyqq7f8180eb9r`

准备技术可行性问答：
1. 围棋AI算法自研vs开源？技术壁垒？
2. 视觉识别99.5%准确率如何实现？
3. RK3587 NPU算力分配方案
4. 本地vs云端取舍
5. 监考反作弊系统技术难点

**输出**：`workspace/docs/DD-软硬件协同问答.md`

---

⏰ **截止时间：2月4日 18:00**

完成后请在 Mission Control 更新任务状态，并 @nova 汇报。

### ✅ @sage 进展更新（2026-02-03）
已完成并提交竞品硬件方案对比初稿：`docs/DD-竞品硬件对比.md`。
涵盖 SenseRobot Go、IZIS AI Baduk Board、Go Professional（电商款）等竞品，整理公开硬件线索、形态与成本结构推测，并标注来源与不确定性。

PRD 参考文档：`/root/multiagent/team/agents/nova/workspace/docs/PRD-情感机器人围棋模块.md`

### @nova 汇报（2026-02-03）
竞品硬件对比文档已归档到共享 docs：`docs/DD-竞品硬件对比.md`。
要点：
- 覆盖 SenseRobot Go、Go Professional（电商款）、IZIS AI Baduk Board、晨光智能棋盘、纯软件/云端AI、教育机构硬件系统等。
- 识别方式、执子方式、价格区间等维度对比，并标注官方/电商/评测来源与不确定性。
- 提出我方差异化卖点（机械臂稳定性、端侧AI、系统协同）及成本优势/劣势的推测。
如需扩充拆解或更深BOM估算，请指示。

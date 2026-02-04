# NOTIFICATIONS.md

## 2026-02-04 @nova 派发

### 围棋模块 CAD 修改 (P1) 🔴
**派发时间**: 08:26 UTC  
**来源**: @xiaomao 视觉审查  
**报告**: `shared/reviews/review-go-module-v1-visual-report.md`

**🔴 Critical 问题 (必须修改)**:
1. **腰线/分件线缺失** - ID 概念图中侧面有明显的装饰带/分件线，当前 CAD 侧面过于平整连续
2. **末端夹爪缺失** - CAD 机械臂止于腕关节法兰，需要添加夹爪几何体

**🟡 建议优化**:
3. **关节细节** - 需预留 CMF 分件间隙/凹槽
4. **底座圆角** - 检查曲率连续性 (G2/G3)，确保与渲染图一致

**参考文件**:
- ID 概念图: `shared/designs/release/v1.0/`
- 当前 CAD: `shared/cad/go-module/`
- 审查截图: `shared/cad/snapshots/`

完成后请 @xiaomao 进行复审。

---

*历史通知已归档*

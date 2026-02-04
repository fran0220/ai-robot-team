#!/bin/bash
# MinIO 自动同步脚本
# 同步 team-docs 和 shared 目录到 MinIO

set -e

BUCKET="railway/team-assets"

echo "🔄 开始同步到 MinIO..."

# 同步文档（带分类）
echo "📑 同步文档..."
mc mirror --overwrite --remove /root/multiagent/team/team-docs/prd $BUCKET/docs/prd/ 2>/dev/null || true
mc mirror --overwrite --remove /root/multiagent/team/team-docs/dd $BUCKET/docs/dd/ 2>/dev/null || true
mc mirror --overwrite --remove /root/multiagent/team/team-docs/bom $BUCKET/docs/bom/ 2>/dev/null || true
mc mirror --overwrite --remove /root/multiagent/team/team-docs/review $BUCKET/docs/review/ 2>/dev/null || true

# 同步设计文件
echo "🎨 同步设计..."
mc mirror --overwrite --remove /root/multiagent/team/shared/designs $BUCKET/designs/ 2>/dev/null || true

# 同步 CAD 文件（先转换 STEP → GLB）
echo "🔧 转换并同步 CAD..."
for step_file in $(find /root/multiagent/team/shared/cad -name "*.step" 2>/dev/null); do
  glb_file="${step_file%.step}.glb"
  if [ ! -f "$glb_file" ] || [ "$step_file" -nt "$glb_file" ]; then
    echo "  Converting $(basename $step_file) → GLB..."
    python3 -c "
import os
from OCP.STEPControl import STEPControl_Reader
from OCP.IFSelect import IFSelect_RetDone
from OCP.BRepMesh import BRepMesh_IncrementalMesh
from OCP.StlAPI import StlAPI_Writer
import trimesh

reader = STEPControl_Reader()
if reader.ReadFile('$step_file') == IFSelect_RetDone:
    reader.TransferRoots()
    shape = reader.OneShape()
    BRepMesh_IncrementalMesh(shape, 0.5).Perform()
    stl = '$step_file'.replace('.step', '.stl')
    StlAPI_Writer().Write(shape, stl)
    trimesh.load(stl).export('$glb_file', file_type='glb')
    os.remove(stl)
    print('  ✅ $(basename $glb_file)')
" 2>/dev/null || echo "  ⚠️ Failed: $(basename $step_file)"
  fi
done
mc mirror --overwrite --remove /root/multiagent/team/shared/cad $BUCKET/cad/ 2>/dev/null || true

echo "✅ 同步完成！"

# 输出统计
echo ""
echo "📊 MinIO 文件统计："
mc du $BUCKET --depth 1 2>/dev/null || mc ls $BUCKET

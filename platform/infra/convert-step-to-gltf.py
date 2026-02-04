#!/usr/bin/env python3
"""
STEP → GLTF 转换工具
用法: python3 convert-step-to-gltf.py input.step output.gltf
"""

import sys
import os

def convert_step_to_gltf(input_path: str, output_path: str) -> bool:
    """将 STEP 文件转换为 GLTF 格式"""
    try:
        import cadquery as cq
        from OCP.STEPControl import STEPControl_Reader
        from OCP.IFSelect import IFSelect_RetDone
        from OCP.TopoDS import TopoDS_Shape
        import trimesh
        import tempfile
        
        print(f"📥 读取 STEP: {input_path}")
        
        # 方法1: 使用 CadQuery 读取
        result = cq.importers.importStep(input_path)
        
        # 导出为 STL（临时）
        with tempfile.NamedTemporaryFile(suffix='.stl', delete=False) as tmp:
            tmp_stl = tmp.name
        
        print(f"🔄 转换中...")
        cq.exporters.export(result, tmp_stl, 'STL')
        
        # 使用 trimesh 转换为 GLTF
        mesh = trimesh.load(tmp_stl)
        
        print(f"💾 保存 GLTF: {output_path}")
        mesh.export(output_path, file_type='gltf')
        
        # 清理临时文件
        os.unlink(tmp_stl)
        
        print(f"✅ 转换成功！")
        return True
        
    except Exception as e:
        print(f"❌ 转换失败: {e}")
        return False

def main():
    if len(sys.argv) < 3:
        print("用法: python3 convert-step-to-gltf.py <input.step> <output.gltf>")
        sys.exit(1)
    
    input_path = sys.argv[1]
    output_path = sys.argv[2]
    
    if not os.path.exists(input_path):
        print(f"❌ 文件不存在: {input_path}")
        sys.exit(1)
    
    success = convert_step_to_gltf(input_path, output_path)
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()

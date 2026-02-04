#!/bin/bash
# 修复符号链接 - 将旧服务器路径替换为本地路径

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "Project root: $PROJECT_ROOT"
echo ""

# 定义路径映射
declare -A PATH_MAP=(
    ["/root/multiagent/team/team-docs"]="$PROJECT_ROOT/team-docs"
    ["/root/multiagent/team/shared/cad"]="$PROJECT_ROOT/shared/cad"
    ["/root/multiagent/team/shared/designs"]="$PROJECT_ROOT/shared/designs"
    ["/root/multiagent/team/shared"]="$PROJECT_ROOT/shared"
)

# 查找并修复符号链接
fix_symlinks() {
    local dir=$1
    echo "Scanning: $dir"
    
    find "$dir" -type l 2>/dev/null | while read -r link; do
        target=$(readlink "$link")
        
        for old_path in "${!PATH_MAP[@]}"; do
            if [[ "$target" == "$old_path"* ]]; then
                new_path="${PATH_MAP[$old_path]}"
                new_target="${target/$old_path/$new_path}"
                
                echo "  Fixing: $link"
                echo "    Old: $target"
                echo "    New: $new_target"
                
                # 删除旧链接并创建新链接
                rm "$link"
                ln -s "$new_target" "$link"
            fi
        done
    done
}

# 修复 agents 目录下的符号链接
fix_symlinks "$PROJECT_ROOT/agents"

echo ""
echo "Done! Verify with: ls -la $PROJECT_ROOT/agents/*/workspace/"

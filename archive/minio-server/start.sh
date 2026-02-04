#!/bin/sh
# MinIO 服务启动脚本
# Railway 会注入 PORT 环境变量
set -e

PORT="${PORT:-9000}"
echo "Starting MinIO on port $PORT..."
exec minio server /data --address ":$PORT" --console-address ":9001"

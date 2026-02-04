#!/bin/sh
# 使用 Railway 的 PORT 环境变量
exec minio server /data --address ":${PORT:-9000}" --console-address ":9001"

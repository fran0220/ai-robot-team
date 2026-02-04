FROM minio/minio:latest

# 创建数据目录
RUN mkdir -p /data

# MinIO 镜像的 ENTRYPOINT 是 minio，所以 CMD 直接是参数
# Railway 注入 PORT 环境变量，但 MinIO 需要用 MINIO_ADDRESS
ENV MINIO_ADDRESS=":9000"
ENV MINIO_CONSOLE_ADDRESS=":9001"

# 由于 Railway 会覆盖 PORT，我们用启动脚本
COPY start.sh /start.sh
RUN chmod +x /start.sh

ENTRYPOINT ["/bin/sh", "/start.sh"]

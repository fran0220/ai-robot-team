# OpenClaw Gateway - AI Robot Team
# Railway deployment

FROM node:20-slim

# Install OpenClaw CLI
RUN npm install -g openclaw@latest

# Create workspace structure
WORKDIR /app

# Copy project files (use Railway-specific config)
COPY openclaw.railway.json ./openclaw.json
COPY platform/ ./platform/
COPY teams/ ./teams/
COPY workspace/ ./workspace/
COPY docs/ ./docs/

# Create state directory (will be mounted as volume)
RUN mkdir -p /data/.openclaw /data/workspace

# Create entrypoint script
RUN cat > /app/entrypoint.sh << 'EOF'
#!/bin/bash
set -e

# Setup paths
export OPENCLAW_CONFIG_PATH=/app/openclaw.json
export OPENCLAW_STATE_DIR=/data/.openclaw

# Create necessary directories
mkdir -p /data/.openclaw/agents
mkdir -p /data/.openclaw/credentials
mkdir -p /data/.openclaw/logs
mkdir -p /data/workspace

# Link workspace directories
ln -sf /data/workspace /app/workspace/runtime 2>/dev/null || true

echo "🦞 Starting OpenClaw Gateway..."
echo "  Config: $OPENCLAW_CONFIG_PATH"
echo "  State:  $OPENCLAW_STATE_DIR"
echo "  Port:   ${PORT:-8080}"

# Start gateway in foreground
exec openclaw gateway --port ${PORT:-8080}
EOF

RUN chmod +x /app/entrypoint.sh

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:${PORT:-8080}/health || exit 1

ENTRYPOINT ["/app/entrypoint.sh"]

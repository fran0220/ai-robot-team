# OpenClaw Gateway - AI Robot Team
# Railway deployment

FROM node:22-slim

# Install dependencies (git required for openclaw install)
RUN apt-get update && apt-get install -y git curl && rm -rf /var/lib/apt/lists/*

# Install OpenClaw CLI
RUN npm install -g openclaw@latest

# Create workspace structure
WORKDIR /app

# Copy project files (use Railway-specific config)
COPY openclaw.railway.json ./openclaw.json
COPY platform/ ./platform/
COPY docs/ ./docs/

# Copy teams directory structure
COPY teams/robotics/configs/ ./teams/robotics/configs/
COPY teams/robotics/docs/ ./teams/robotics/docs/
COPY teams/robotics/shared/ ./teams/robotics/shared/

# Copy agent workspaces explicitly (ensure personality files are included)
COPY teams/robotics/agents/nova/workspace/ ./teams/robotics/agents/nova/workspace/
COPY teams/robotics/agents/sage/workspace/ ./teams/robotics/agents/sage/workspace/
COPY teams/robotics/agents/atlas/workspace/ ./teams/robotics/agents/atlas/workspace/
COPY teams/robotics/agents/jarvis/workspace/ ./teams/robotics/agents/jarvis/workspace/
COPY teams/robotics/agents/friday/workspace/ ./teams/robotics/agents/friday/workspace/
COPY teams/robotics/agents/vision/workspace/ ./teams/robotics/agents/vision/workspace/
COPY teams/robotics/agents/idra/workspace/ ./teams/robotics/agents/idra/workspace/
COPY teams/robotics/agents/mech/workspace/ ./teams/robotics/agents/mech/workspace/
COPY teams/robotics/agents/xiaomao/workspace/ ./teams/robotics/agents/xiaomao/workspace/

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

# Debug: check if Nova workspace files exist
echo "📁 Checking Nova workspace files..."
echo "--- /app/teams/robotics ---"
ls -la /app/teams/robotics/ 2>&1 || echo "❌ not found"
echo "--- /app/teams/robotics/agents ---"
ls -la /app/teams/robotics/agents/ 2>&1 || echo "❌ not found"
echo "--- /app/teams/robotics/agents/nova ---"
ls -la /app/teams/robotics/agents/nova/ 2>&1 || echo "❌ not found"
echo "--- /app/teams/robotics/agents/nova/workspace ---"
ls -la /app/teams/robotics/agents/nova/workspace/ 2>&1 || echo "❌ not found"

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

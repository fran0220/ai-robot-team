#!/bin/bash
# Task status update helper for Mission Control (Convex)
# Usage: task-status.sh <taskId> <status> [agentName] [comment] [reviewerName]
# status: in_progress | review | done | blocked
# Example:
#   task-status.sh js7... in_progress friday
#   task-status.sh js7... review friday "Ready for review" xiaomao
#   task-status.sh js7... done xiaomao "Approved"

set -euo pipefail

CONVEX_URL="https://convex-backend-production-3dbe.up.railway.app"
OPENCLAW_CONFIG="/root/multiagent/team/openclaw.json"

TASK_ID=${1:-}
STATUS=${2:-}
AGENT_NAME=${3:-}
COMMENT=${4:-}
REVIEWER_NAME=${5:-}

if [[ -z "$TASK_ID" || -z "$STATUS" ]]; then
  echo "Usage: task-status.sh <taskId> <status> [agentName] [comment] [reviewerName]" >&2
  exit 1
fi

if ! command -v jq >/dev/null 2>&1; then
  echo "jq is required but not installed." >&2
  exit 1
fi

# Resolve agent name from session if not provided
if [[ -z "${AGENT_NAME}" ]]; then
  if [[ -n "${OPENCLAW_SESSION_KEY:-}" ]]; then
    AGENT_NAME=$(echo "$OPENCLAW_SESSION_KEY" | awk -F: '{print $2}')
  fi
fi

if [[ -z "${AGENT_NAME}" ]]; then
  echo "agentName is required (or set OPENCLAW_SESSION_KEY)." >&2
  exit 1
fi

AGENT_NAME_LOWER=$(echo "$AGENT_NAME" | tr '[:upper:]' '[:lower:]')

get_agent_id() {
  local name_lower="$1"
  local name_cap
  name_cap=$(printf "%s" "$name_lower" | sed 's/^./\U&/')

  curl -s "$CONVEX_URL/api/query" \
    -H "Content-Type: application/json" \
    -d '{"path": "agents:list", "args": {}}' \
    | jq -r --arg name_cap "$name_cap" --arg name_lower "$name_lower" '.value[] | select((.name | ascii_downcase) == $name_lower or (.name == $name_cap)) | ._id' \
    | head -n 1
}

AGENT_ID=$(get_agent_id "$AGENT_NAME_LOWER")
if [[ -z "$AGENT_ID" || "$AGENT_ID" == "null" ]]; then
  echo "Agent not found in Convex for name: $AGENT_NAME" >&2
  exit 1
fi

case "$STATUS" in
  in_progress|blocked|done)
    curl -s -X POST "$CONVEX_URL/api/mutation" \
      -H "Content-Type: application/json" \
      -d "{\"path\":\"tasks:updateStatus\",\"args\":{\"taskId\":\"$TASK_ID\",\"status\":\"$STATUS\",\"updatedBy\":\"$AGENT_ID\"}}" \
      | jq .
    ;;
  review)
    # Submit for review (optional comment + reviewer name)
    REVIEWER_ID=""
    if [[ -n "${REVIEWER_NAME}" ]]; then
      REVIEWER_ID=$(get_agent_id "$(echo "$REVIEWER_NAME" | tr '[:upper:]' '[:lower:]')")
    fi

    if [[ -n "${COMMENT}" ]]; then
      if [[ -n "${REVIEWER_ID}" && "${REVIEWER_ID}" != "null" ]]; then
        curl -s -X POST "$CONVEX_URL/api/mutation" \
          -H "Content-Type: application/json" \
          -d "{\"path\":\"tasks:submitForReview\",\"args\":{\"taskId\":\"$TASK_ID\",\"updatedBy\":\"$AGENT_ID\",\"reviewComment\":\"$COMMENT\",\"reviewerId\":\"$REVIEWER_ID\"}}" \
          | jq .
      else
        curl -s -X POST "$CONVEX_URL/api/mutation" \
          -H "Content-Type: application/json" \
          -d "{\"path\":\"tasks:submitForReview\",\"args\":{\"taskId\":\"$TASK_ID\",\"updatedBy\":\"$AGENT_ID\",\"reviewComment\":\"$COMMENT\"}}" \
          | jq .
      fi
    else
      if [[ -n "${REVIEWER_ID}" && "${REVIEWER_ID}" != "null" ]]; then
        curl -s -X POST "$CONVEX_URL/api/mutation" \
          -H "Content-Type: application/json" \
          -d "{\"path\":\"tasks:submitForReview\",\"args\":{\"taskId\":\"$TASK_ID\",\"updatedBy\":\"$AGENT_ID\",\"reviewerId\":\"$REVIEWER_ID\"}}" \
          | jq .
      else
        curl -s -X POST "$CONVEX_URL/api/mutation" \
          -H "Content-Type: application/json" \
          -d "{\"path\":\"tasks:submitForReview\",\"args\":{\"taskId\":\"$TASK_ID\",\"updatedBy\":\"$AGENT_ID\"}}" \
          | jq .
      fi
    fi
    ;;
  *)
    echo "Invalid status: $STATUS" >&2
    echo "Allowed: in_progress | review | done | blocked" >&2
    exit 1
    ;;
esac

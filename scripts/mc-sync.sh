#!/bin/bash
# Mission Control 同步脚本
# 用法: mc-sync.sh <command> [args...]

CONVEX_URL="https://convex-backend-production-3dbe.up.railway.app"

# Agent IDs
NOVA_ID="j97337btb37x06bkq3c1md51zh80ezf9"
SAGE_ID="j974hbc77xa25daq6r2wwp1ndn80extj"
ATLAS_ID="j974c26hvn5q4as90rwr84tmhs80fz2h"
JARVIS_ID="j97fe7kxr5pewaqabj9v8f17qx80ff9r"
FRIDAY_ID="j97dmaw0vcae01r05srky34cr180fj70"
VISION_ID="j977yjwcy37sj9t6ac1xt9kk6180ekky"

call_convex() {
    local path=$1
    local args=$2
    curl -s -X POST "$CONVEX_URL/api/mutation" \
        -H "Content-Type: application/json" \
        -d "{\"path\":\"$path\",\"args\":$args}"
}

query_convex() {
    local path=$1
    local args=${2:-"{}"}
    curl -s "$CONVEX_URL/api/query" \
        -H "Content-Type: application/json" \
        -d "{\"path\":\"$path\",\"args\":$args}"
}

case "$1" in
    # 创建任务
    create-task)
        # mc-sync.sh create-task "标题" "描述" "P1" "nova"
        TITLE="$2"
        DESC="$3"
        PRIORITY="${4:-P2}"
        AGENT="${5:-nova}"
        
        case "$AGENT" in
            nova) AGENT_ID=$NOVA_ID ;;
            sage) AGENT_ID=$SAGE_ID ;;
            atlas) AGENT_ID=$ATLAS_ID ;;
            jarvis) AGENT_ID=$JARVIS_ID ;;
            friday) AGENT_ID=$FRIDAY_ID ;;
            vision) AGENT_ID=$VISION_ID ;;
            *) AGENT_ID=$NOVA_ID ;;
        esac
        
        call_convex "tasks:create" "{\"title\":\"$TITLE\",\"description\":\"$DESC\",\"priority\":\"$PRIORITY\",\"createdBy\":\"$AGENT_ID\"}"
        ;;
    
    # 更新任务状态
    update-status)
        # mc-sync.sh update-status <task_id> <status> <agent>
        TASK_ID="$2"
        STATUS="$3"
        AGENT="${4:-nova}"
        
        case "$AGENT" in
            nova) AGENT_ID=$NOVA_ID ;;
            sage) AGENT_ID=$SAGE_ID ;;
            *) AGENT_ID=$NOVA_ID ;;
        esac
        
        call_convex "tasks:updateStatus" "{\"taskId\":\"$TASK_ID\",\"status\":\"$STATUS\",\"updatedBy\":\"$AGENT_ID\"}"
        ;;
    
    # 分配任务
    assign)
        # mc-sync.sh assign <task_id> <agent1,agent2> <assigned_by>
        TASK_ID="$2"
        AGENTS="$3"
        BY="${4:-nova}"
        
        case "$BY" in
            nova) BY_ID=$NOVA_ID ;;
            *) BY_ID=$NOVA_ID ;;
        esac
        
        # 解析agents
        IFS=',' read -ra AGENT_NAMES <<< "$AGENTS"
        AGENT_IDS="["
        for name in "${AGENT_NAMES[@]}"; do
            case "$name" in
                nova) AGENT_IDS+="\"$NOVA_ID\"," ;;
                sage) AGENT_IDS+="\"$SAGE_ID\"," ;;
                atlas) AGENT_IDS+="\"$ATLAS_ID\"," ;;
                jarvis) AGENT_IDS+="\"$JARVIS_ID\"," ;;
                friday) AGENT_IDS+="\"$FRIDAY_ID\"," ;;
                vision) AGENT_IDS+="\"$VISION_ID\"," ;;
            esac
        done
        AGENT_IDS="${AGENT_IDS%,}]"
        
        call_convex "tasks:assign" "{\"taskId\":\"$TASK_ID\",\"assigneeIds\":$AGENT_IDS,\"assignedBy\":\"$BY_ID\"}"
        ;;
    
    # 心跳
    heartbeat)
        AGENT="${2:-nova}"
        case "$AGENT" in
            nova) AGENT_ID=$NOVA_ID ;;
            sage) AGENT_ID=$SAGE_ID ;;
            atlas) AGENT_ID=$ATLAS_ID ;;
            jarvis) AGENT_ID=$JARVIS_ID ;;
            friday) AGENT_ID=$FRIDAY_ID ;;
            vision) AGENT_ID=$VISION_ID ;;
            *) AGENT_ID=$NOVA_ID ;;
        esac
        call_convex "agents:heartbeat" "{\"id\":\"$AGENT_ID\"}"
        ;;
    
    # 查看任务
    list-tasks)
        query_convex "tasks:list" | jq .
        ;;
    
    # 查看inbox
    inbox)
        query_convex "tasks:getInbox" | jq .
        ;;
    
    # 查看agents
    agents)
        query_convex "agents:list" | jq '.value[] | {name, status, lastHeartbeat}'
        ;;
    
    *)
        echo "Mission Control 同步脚本"
        echo ""
        echo "用法:"
        echo "  mc-sync.sh create-task \"标题\" \"描述\" \"P1\" \"nova\""
        echo "  mc-sync.sh update-status <task_id> <status> <agent>"
        echo "  mc-sync.sh assign <task_id> <agent1,agent2> <by_agent>"
        echo "  mc-sync.sh heartbeat <agent>"
        echo "  mc-sync.sh list-tasks"
        echo "  mc-sync.sh inbox"
        echo "  mc-sync.sh agents"
        echo ""
        echo "状态: inbox, assigned, in_progress, review, blocked, done"
        echo "优先级: P0, P1, P2, P3"
        echo "Agents: nova, sage, atlas, jarvis, friday, vision"
        ;;
esac

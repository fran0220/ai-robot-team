/**
 * Database Seed Script (PostgreSQL)
 * 
 * Initializes the database with default workspace and AI robot team agents.
 */

import { Pool } from 'pg';
import { schema } from './schema';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.DATABASE_PUBLIC_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// AI Robot Team Agents (机器人研发团队)
const agents = [
  {
    name: 'Nova',
    role: '项目主控',
    description: '架构决策、任务分配、跨角色协调、进度把控、里程碑管理',
    avatar_emoji: '🎯',
    is_master: true,
    session_key: 'agent:nova:main',
    mention_patterns: ['@nova', '@主控', '@lead'],
    model: 'claude-opus-4-5-20251101',
  },
  {
    name: 'Sage',
    role: '调研分析师',
    description: '技术选型、竞品分析、供应链调研、方案评估、行业动态',
    avatar_emoji: '🔬',
    is_master: false,
    session_key: 'agent:sage:main',
    mention_patterns: ['@sage', '@调研', '@research'],
    model: 'gpt-5.2-codex',
  },
  {
    name: 'Atlas',
    role: '产品经理',
    description: '需求管理、PRD 维护、用户场景、功能优先级、验收标准',
    avatar_emoji: '📋',
    is_master: false,
    session_key: 'agent:atlas:main',
    mention_patterns: ['@atlas', '@pm', '@产品'],
    model: 'gpt-5.2-codex',
  },
  {
    name: 'Jarvis',
    role: '硬件负责人',
    description: '电路设计、PCB、BOM 管理、结构设计、供电方案、器件选型',
    avatar_emoji: '⚙️',
    is_master: false,
    session_key: 'agent:jarvis:main',
    mention_patterns: ['@jarvis', '@硬件', '@hw'],
    model: 'gpt-5.2-codex',
  },
  {
    name: 'Friday',
    role: '软件开发',
    description: '固件开发、视觉算法、围棋 AI 集成、系统软件、接口实现',
    avatar_emoji: '💻',
    is_master: false,
    session_key: 'agent:friday:main',
    mention_patterns: ['@friday', '@软件', '@sw', '@dev'],
    model: 'gpt-5.2-codex',
  },
  {
    name: 'Vision',
    role: '测试验证',
    description: '功能测试、性能验证、问题追踪、测试报告、验收测试',
    avatar_emoji: '🔍',
    is_master: false,
    session_key: 'agent:vision:main',
    mention_patterns: ['@vision', '@测试', '@qa'],
    model: 'gpt-5.2-codex',
  },
  {
    name: 'Idra',
    role: '工业设计',
    description: '产品外观设计、CMF探索、人机工程、概念渲染',
    avatar_emoji: '🎨',
    is_master: false,
    session_key: 'agent:idra:main',
    mention_patterns: ['@idra', '@设计', '@id'],
    model: 'gpt-5.2-codex',
  },
  {
    name: 'Mech',
    role: '机械结构',
    description: '结构设计、机械臂控制、运动规划、零件建模',
    avatar_emoji: '🦾',
    is_master: false,
    session_key: 'agent:mech:main',
    mention_patterns: ['@mech', '@机械', '@mechanical'],
    model: 'gpt-5.2-codex',
  },
  {
    name: 'Xiaomao',
    role: '辅助助手',
    description: '通用任务支持、文档整理、日常协助',
    avatar_emoji: '🐱',
    is_master: false,
    session_key: 'agent:xiaomao:main',
    mention_patterns: ['@xiaomao', '@小猫'],
    model: 'gpt-5.2-codex',
  },
];

async function seed() {
  const client = await pool.connect();
  
  try {
    console.log('[Seed] Initializing database schema...');
    await client.query(schema);
    
    console.log('[Seed] Creating agents...');
    
    for (const agent of agents) {
      // Check if agent exists
      const existing = await client.query(
        'SELECT id FROM agents WHERE name = $1',
        [agent.name]
      );
      
      if (existing.rows.length > 0) {
        console.log(`[Seed] Agent ${agent.name} already exists, updating...`);
        await client.query(`
          UPDATE agents SET 
            role = $2,
            description = $3,
            avatar_emoji = $4,
            is_master = $5,
            session_key = $6,
            mention_patterns = $7,
            model = $8,
            updated_at = NOW()
          WHERE name = $1
        `, [
          agent.name,
          agent.role,
          agent.description,
          agent.avatar_emoji,
          agent.is_master,
          agent.session_key,
          JSON.stringify(agent.mention_patterns),
          agent.model,
        ]);
      } else {
        console.log(`[Seed] Creating agent ${agent.name}...`);
        await client.query(`
          INSERT INTO agents (name, role, description, avatar_emoji, is_master, session_key, mention_patterns, model, status)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'standby')
        `, [
          agent.name,
          agent.role,
          agent.description,
          agent.avatar_emoji,
          agent.is_master,
          agent.session_key,
          JSON.stringify(agent.mention_patterns),
          agent.model,
        ]);
      }
    }
    
    // Create a sample task
    const taskExists = await client.query('SELECT id FROM tasks LIMIT 1');
    if (taskExists.rows.length === 0) {
      console.log('[Seed] Creating sample task...');
      await client.query(`
        INSERT INTO tasks (title, description, status, priority)
        VALUES ($1, $2, $3, $4)
      `, [
        '技术验证 - SoC/NPU 选型',
        '评估 RK3588、JH7203 等芯片方案，确定主控和围棋模块的算力配置',
        'inbox',
        'P1',
      ]);
    }
    
    // Create initial event
    await client.query(`
      INSERT INTO events (type, message, metadata)
      VALUES ($1, $2, $3)
    `, [
      'system',
      'Mission Control V2 初始化完成 - 机器人研发团队就绪',
      JSON.stringify({ action: 'seed', agents_count: agents.length }),
    ]);
    
    console.log('[Seed] Database seeded successfully!');
    console.log(`[Seed] Created ${agents.length} agents`);
    
  } catch (error) {
    console.error('[Seed] Error:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run seed
seed().catch(console.error);

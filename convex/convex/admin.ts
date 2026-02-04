import { mutation } from "./_generated/server";

// 清理所有任务
export const clearTasks = mutation({
  args: {},
  handler: async (ctx) => {
    const tasks = await ctx.db.query("tasks").collect();
    for (const task of tasks) {
      await ctx.db.delete(task._id);
    }
    return { deleted: tasks.length };
  },
});

// 清理所有消息
export const clearMessages = mutation({
  args: {},
  handler: async (ctx) => {
    const messages = await ctx.db.query("messages").collect();
    for (const msg of messages) {
      await ctx.db.delete(msg._id);
    }
    return { deleted: messages.length };
  },
});

// 清理所有活动
export const clearActivities = mutation({
  args: {},
  handler: async (ctx) => {
    const activities = await ctx.db.query("activities").collect();
    for (const activity of activities) {
      await ctx.db.delete(activity._id);
    }
    return { deleted: activities.length };
  },
});

// 清理所有通知
export const clearNotifications = mutation({
  args: {},
  handler: async (ctx) => {
    const notifications = await ctx.db.query("notifications").collect();
    for (const notification of notifications) {
      await ctx.db.delete(notification._id);
    }
    return { deleted: notifications.length };
  },
});

// 重置Agent状态（保留agent记录，只清理状态）
export const resetAgents = mutation({
  args: {},
  handler: async (ctx) => {
    const agents = await ctx.db.query("agents").collect();
    for (const agent of agents) {
      await ctx.db.patch(agent._id, {
        status: "idle",
        currentTaskId: undefined,
        lastHeartbeat: undefined,
      });
    }
    return { reset: agents.length };
  },
});

// 清理全部（除了agents基础信息）
export const clearAll = mutation({
  args: {},
  handler: async (ctx) => {
    let count = { tasks: 0, messages: 0, activities: 0, notifications: 0, agents: 0 };

    // 清理tasks
    const tasks = await ctx.db.query("tasks").collect();
    for (const t of tasks) await ctx.db.delete(t._id);
    count.tasks = tasks.length;

    // 清理messages
    const messages = await ctx.db.query("messages").collect();
    for (const m of messages) await ctx.db.delete(m._id);
    count.messages = messages.length;

    // 清理activities
    const activities = await ctx.db.query("activities").collect();
    for (const a of activities) await ctx.db.delete(a._id);
    count.activities = activities.length;

    // 清理notifications
    const notifications = await ctx.db.query("notifications").collect();
    for (const n of notifications) await ctx.db.delete(n._id);
    count.notifications = notifications.length;

    // 重置agents状态
    const agents = await ctx.db.query("agents").collect();
    for (const agent of agents) {
      await ctx.db.patch(agent._id, {
        status: "idle",
        currentTaskId: undefined,
        lastHeartbeat: undefined,
      });
    }
    count.agents = agents.length;

    return count;
  },
});

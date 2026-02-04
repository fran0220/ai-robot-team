'use client';

import { useState } from 'react';
import { Plus, ChevronRight, GripVertical } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMissionControl } from '@/lib/store';
import type { Task, TaskStatus } from '@/lib/types';
import { TaskModal } from './TaskModal';
import { formatDistanceToNow } from 'date-fns';

interface MissionQueueProps {
  workspaceId?: string;
}

const COLUMNS: { id: TaskStatus; labelKey: string; color: string }[] = [
  { id: 'planning', labelKey: 'queue.planning', color: 'border-t-mc-accent-purple' },
  { id: 'inbox', labelKey: 'queue.inbox', color: 'border-t-mc-accent-pink' },
  { id: 'assigned', labelKey: 'queue.assigned', color: 'border-t-mc-accent-yellow' },
  { id: 'in_progress', labelKey: 'queue.inProgress', color: 'border-t-mc-accent' },
  { id: 'testing', labelKey: 'queue.testing', color: 'border-t-mc-accent-cyan' },
  { id: 'review', labelKey: 'queue.review', color: 'border-t-mc-accent-purple' },
  { id: 'done', labelKey: 'queue.done', color: 'border-t-mc-accent-green' },
];

export function MissionQueue({ workspaceId }: MissionQueueProps) {
  const t = useTranslations();
  const { tasks, updateTaskStatus, addEvent } = useMissionControl();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  const getTasksByStatus = (status: TaskStatus) =>
    tasks.filter((task) => task.status === status);

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    if (!draggedTask || draggedTask.status === targetStatus) {
      setDraggedTask(null);
      return;
    }

    // Optimistic update
    updateTaskStatus(draggedTask.id, targetStatus);

    // Persist to API
    try {
      const res = await fetch(`/api/tasks/${draggedTask.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: targetStatus }),
      });

      if (res.ok) {
        // Add event
        addEvent({
          id: crypto.randomUUID(),
          type: targetStatus === 'done' ? 'task_completed' : 'task_status_changed',
          task_id: draggedTask.id,
          message: `Task "${draggedTask.title}" moved to ${targetStatus}`,
          created_at: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Failed to update task status:', error);
      // Revert on error
      updateTaskStatus(draggedTask.id, draggedTask.status);
    }

    setDraggedTask(null);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-mc-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ChevronRight className="w-4 h-4 text-mc-text-secondary" />
          <span className="text-sm font-medium uppercase tracking-wider">{t('queue.missionQueue')}</span>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-3 py-1.5 bg-mc-accent-pink text-mc-bg rounded text-sm font-medium hover:bg-mc-accent-pink/90"
        >
          <Plus className="w-4 h-4" />
          {t('queue.newTask')}
        </button>
      </div>

      {/* Kanban Columns */}
      <div className="flex-1 flex gap-3 p-3 overflow-x-auto">
        {COLUMNS.map((column) => {
          const columnTasks = getTasksByStatus(column.id);
          return (
            <div
              key={column.id}
              className={`flex-1 min-w-[200px] max-w-[280px] flex flex-col bg-mc-bg rounded border border-mc-border border-t-2 ${column.color}`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              {/* Column Header */}
              <div className="p-2 border-b border-mc-border flex items-center justify-between">
                <span className="text-xs font-medium uppercase text-mc-text-secondary">
                  {t(column.labelKey)}
                </span>
                <span className="text-xs bg-mc-bg-tertiary px-2 py-0.5 rounded text-mc-text-secondary">
                  {columnTasks.length}
                </span>
              </div>

              {/* Tasks */}
              <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {columnTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onDragStart={handleDragStart}
                    onClick={() => setEditingTask(task)}
                    isDragging={draggedTask?.id === task.id}
                    t={t}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <TaskModal onClose={() => setShowCreateModal(false)} workspaceId={workspaceId} />
      )}
      {editingTask && (
        <TaskModal task={editingTask} onClose={() => setEditingTask(null)} workspaceId={workspaceId} />
      )}
    </div>
  );
}

interface TaskCardProps {
  task: Task;
  onDragStart: (e: React.DragEvent, task: Task) => void;
  onClick: () => void;
  isDragging: boolean;
  t: ReturnType<typeof useTranslations>;
}

function TaskCard({ task, onDragStart, onClick, isDragging, t }: TaskCardProps) {
  const priorityColors = {
    low: 'bg-mc-text-secondary/20',
    normal: 'bg-mc-accent/20',
    high: 'bg-mc-accent-yellow/20',
    urgent: 'bg-mc-accent-red/20',
  };

  const isPlanning = task.status === 'planning';

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task)}
      onClick={onClick}
      className={`bg-mc-bg-secondary border rounded p-3 cursor-pointer transition-all ${
        isDragging ? 'opacity-50 scale-95' : ''
      } ${isPlanning ? 'border-purple-500/50 hover:border-purple-500' : 'border-mc-border hover:border-mc-accent/50'}`}
    >
      <div className="flex items-start gap-2">
        <GripVertical className="w-4 h-4 text-mc-text-secondary mt-0.5 cursor-grab" />
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium truncate">{task.title}</h4>
          
          {/* Planning mode indicator */}
          {isPlanning && (
            <div className="flex items-center gap-2 mt-2 p-2 bg-purple-500/10 rounded border border-purple-500/20">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
              <span className="text-xs text-purple-400">{t('queue.clickToContinuePlanning')}</span>
            </div>
          )}

          {task.assigned_agent && (
            <div className="flex items-center gap-1 mt-2">
              <span className="text-sm">{(task.assigned_agent as unknown as { avatar_emoji: string }).avatar_emoji}</span>
              <span className="text-xs text-mc-text-secondary truncate">
                {(task.assigned_agent as unknown as { name: string }).name}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between mt-2">
            <span
              className={`text-xs px-2 py-0.5 rounded ${priorityColors[task.priority]}`}
            >
              {task.priority}
            </span>
            <span className="text-xs text-mc-text-secondary">
              {formatDistanceToNow(new Date(task.created_at), { addSuffix: true })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

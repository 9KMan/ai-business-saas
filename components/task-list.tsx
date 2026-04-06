'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Trash2, CheckCircle2, Circle, Clock } from 'lucide-react';
import type { Task, Priority, TaskStatus } from '@/types/database';

interface TaskListProps {
  tasks: Task[];
  onTaskChange?: () => void;
}

const priorityConfig: Record<Priority, { label: string; color: string }> = {
  low: { label: 'Low', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
  medium: { label: 'Medium', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' },
  high: { label: 'High', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' },
};

const statusConfig: Record<TaskStatus, { label: string; icon: React.ReactNode }> = {
  pending: { label: 'Pending', icon: <Circle className="h-4 w-4" /> },
  in_progress: { label: 'In Progress', icon: <Clock className="h-4 w-4" /> },
  completed: { label: 'Completed', icon: <CheckCircle2 className="h-4 w-4" /> },
};

export function TaskList({ tasks, onTaskChange }: TaskListProps) {
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = (taskId: string) => {
    if (!confirm('Delete this task?')) return;
    setDeletingId(taskId);

    startTransition(async () => {
      try {
        const res = await fetch(`/api/tasks?id=${taskId}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete');
        onTaskChange?.();
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Failed to delete task');
      } finally {
        setDeletingId(null);
      }
    });
  };

  const handleToggleStatus = (task: Task) => {
    const nextStatus: Record<TaskStatus, TaskStatus> = {
      pending: 'in_progress',
      in_progress: 'completed',
      completed: 'pending',
    };

    startTransition(async () => {
      try {
        const res = await fetch(`/api/tasks?id=${task.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: nextStatus[task.status] }),
        });
        if (!res.ok) throw new Error('Failed to update');
        onTaskChange?.();
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Failed to update task');
      }
    });
  };

  if (tasks.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <p>No tasks yet. Create your first one!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => {
        const priority = priorityConfig[task.priority];
        const status = statusConfig[task.status];
        const isDeleting = deletingId === task.id;
        const isCompleted = task.status === 'completed';

        return (
          <Card
            key={task.id}
            className={`transition-opacity ${isDeleting ? 'opacity-50' : ''} ${isCompleted ? 'opacity-60' : ''}`}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <button
                  onClick={() => handleToggleStatus(task)}
                  className="mt-0.5 flex-shrink-0 text-muted-foreground hover:text-primary transition-colors"
                  disabled={isPending}
                >
                  {status.icon}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className={`font-medium ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                      {task.title}
                    </p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priority.color}`}>
                      {priority.label}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                      {status.label}
                    </span>
                  </div>

                  {task.description && (
                    <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                  )}

                  {task.due_date && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Due: {new Date(task.due_date).toLocaleDateString()}
                    </p>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive flex-shrink-0"
                  onClick={() => handleDelete(task.id)}
                  disabled={isDeleting}
                >
                  {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

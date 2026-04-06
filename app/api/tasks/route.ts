import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { Task, Priority, TaskStatus, AiInterpretationResult } from '@/types/database';

// GET /api/tasks - List all tasks for authenticated user
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(tasks ?? []);
  } catch (err) {
    console.error('GET tasks error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

// POST /api/tasks - Create a new task
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json() as AiInterpretationResult;
    const { title, description, priority = 'medium', due_date } = body;

    if (!title || typeof title !== 'string') {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const validPriorities: Priority[] = ['low', 'medium', 'high'];
    const taskPriority: Priority = validPriorities.includes(priority) ? priority : 'medium';

    // Validate due_date format if provided
    let parsedDueDate: string | null = null;
    if (due_date) {
      const date = new Date(due_date);
      if (!isNaN(date.getTime())) {
        parsedDueDate = date.toISOString().split('T')[0];
      }
    }

    const newTask: Omit<Task, 'id' | 'created_at' | 'updated_at'> = {
      user_id: user.id,
      title: title.trim(),
      description: description?.trim() || null,
      priority: taskPriority,
      status: 'pending',
      due_date: parsedDueDate,
    };

    const { data: task, error } = await supabase
      .from('tasks')
      .insert(newTask)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(task, { status: 201 });
  } catch (err) {
    console.error('POST tasks error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to create task' },
      { status: 500 }
    );
  }
}

// PATCH /api/tasks - Update a task
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('id');

    if (!taskId) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const { title, description, priority, status, due_date } = body as Partial<Task>;

    // Build update object
    const updates: Partial<Task> = {};
    if (title !== undefined) updates.title = title.trim();
    if (description !== undefined) updates.description = description?.trim() || null;
    if (priority !== undefined) {
      const validPriorities: Priority[] = ['low', 'medium', 'high'];
      if (validPriorities.includes(priority)) updates.priority = priority;
    }
    if (status !== undefined) {
      const validStatuses: TaskStatus[] = ['pending', 'in_progress', 'completed'];
      if (validStatuses.includes(status)) updates.status = status;
    }
    if (due_date !== undefined) {
      updates.due_date = due_date ? new Date(due_date).toISOString().split('T')[0] : null;
    }

    const { data: task, error } = await supabase
      .from('tasks')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', taskId)
      .eq('user_id', user.id) // Ensure user owns the task
      .select()
      .single();

    if (error) throw error;
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json(task);
  } catch (err) {
    console.error('PATCH tasks error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to update task' },
      { status: 500 }
    );
  }
}

// DELETE /api/tasks - Delete a task
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('id');

    if (!taskId) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)
      .eq('user_id', user.id); // Ensure user owns the task

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('DELETE tasks error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to delete task' },
      { status: 500 }
    );
  }
}

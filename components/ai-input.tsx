'use client';

import { useState, useRef, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Loader2, AlertCircle } from 'lucide-react';
import type { AiInterpretationResult } from '@/types/database';

interface AiInputProps {
  onTaskCreated?: () => void;
}

export function AiInput({ onTaskCreated }: AiInputProps) {
  const [text, setText] = useState('');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<AiInterpretationResult | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInterpret = () => {
    if (!text.trim()) return;
    setError(null);
    setPreview(null);

    startTransition(async () => {
      try {
        const res = await fetch('/api/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: text.trim(), lang: 'en' }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Failed to interpret task');
        }

        const result: AiInterpretationResult = await res.json();
        setPreview(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      }
    });
  };

  const handleCreateTask = async () => {
    if (!preview) return;
    setError(null);

    startTransition(async () => {
      try {
        const res = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(preview),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Failed to create task');
        }

        setText('');
        setPreview(null);
        onTaskCreated?.();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleInterpret();
    }
  };

  const priorityColors: Record<string, string> = {
    low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Task Creator
        </CardTitle>
        <CardDescription>
          Describe your task naturally — AI will structure it for you. Press Ctrl+Enter to interpret.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g., Create 50 units of Product X ship by Dec 15, high priority"
            className="min-h-[100px] resize-none"
            disabled={isPending}
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <div className="flex gap-2">
          <Button onClick={handleInterpret} disabled={!text.trim() || isPending} variant="outline">
            {isPending && !preview ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            <span className="ml-2">Interpret</span>
          </Button>

          {preview && (
            <Button onClick={handleCreateTask} disabled={isPending}>
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Create Task'
              )}
            </Button>
          )}

          {preview && (
            <Button
              variant="ghost"
              onClick={() => { setPreview(null); setText(''); }}
              disabled={isPending}
            >
              Cancel
            </Button>
          )}
        </div>

        {preview && (
          <div className="bg-muted/50 rounded-lg p-4 space-y-3 border">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm">Preview</h4>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${priorityColors[preview.priority]}`}>
                {preview.priority}
              </span>
            </div>
            <div>
              <p className="font-medium">{preview.title}</p>
              {preview.description && (
                <p className="text-sm text-muted-foreground mt-1">{preview.description}</p>
              )}
              {preview.due_date && (
                <p className="text-sm text-muted-foreground mt-1">
                  Due: {new Date(preview.due_date).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

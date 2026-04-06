'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AiInput } from '@/components/ai-input';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NewTaskPage() {
  const router = useRouter();

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/tasks">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Create New Task</h1>
          <p className="text-muted-foreground mt-1">Use AI to structure your task from natural language.</p>
        </div>
      </div>

      <AiInput onTaskCreated={() => router.push('/dashboard/tasks')} />
    </div>
  );
}

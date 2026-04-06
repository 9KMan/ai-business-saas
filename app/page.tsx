import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Globe, Zap } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">AI Business SaaS</span>
          </div>
          <Link href="/auth/login">
            <Button>Login</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          AI-Powered Business Management
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          Streamline your business with intelligent task management powered by AI.
          Create tasks naturally, set priorities, and focus on what matters.
        </p>
        <Link href="/auth/login">
          <Button size="lg" className="text-lg px-8">
            Get Started
          </Button>
        </Link>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <Sparkles className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Natural Language Tasks</CardTitle>
              <CardDescription>
                Describe tasks in plain English and let AI do the structuring.
                No more wrestling with forms — just type what you need.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Globe className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Multi-language Support</CardTitle>
              <CardDescription>
                Work in English, Hebrew (RTL), Spanish, French, or German.
                AI understands your language and adapts.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Zap className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Smart Prioritization</CardTitle>
              <CardDescription>
                AI helps you focus on what matters most. Automatically extracts
                priority levels and due dates from your descriptions.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t mt-16 py-8 text-center text-muted-foreground text-sm">
        <p>&copy; {new Date().getFullYear()} AI Business SaaS. All rights reserved.</p>
      </footer>
    </div>
  );
}

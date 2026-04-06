'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { SUPPORTED_LOCALES, type SupportedLocale } from '@/types/database';
import { createClient } from '@/lib/supabase/client';

const localeNames: Record<SupportedLocale, string> = {
  en: 'English',
  he: 'עברית (Hebrew)',
  es: 'Español (Spanish)',
  fr: 'Français (French)',
  de: 'Deutsch (German)',
};

export default function SettingsPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [fullName, setFullName] = useState('');
  const [locale, setLocale] = useState<SupportedLocale>('en');

  const supabase = createClient();

  const handleSave = () => {
    setSaved(false);
    startTransition(async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        // Update profile
        const { error } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            full_name: fullName,
            locale,
            email: user.email,
          });

        if (error) throw error;

        // Set cookie for locale
        document.cookie = `locale=${locale};path=/;max-age=31536000`;

        setSaved(true);
        setTimeout(() => setSaved(false), 3000);

        // Refresh to apply RTL changes
        router.refresh();
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Failed to save settings');
      }
    });
  };

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your profile and preferences.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Your personal information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="fullName" className="text-sm font-medium">Full Name</label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
              disabled={isPending}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Language</CardTitle>
          <CardDescription>
            Choose your preferred language. Hebrew will enable RTL layout.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="locale" className="text-sm font-medium">Language</label>
            <select
              id="locale"
              value={locale}
              onChange={(e) => setLocale(e.target.value as SupportedLocale)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isPending}
            >
              {SUPPORTED_LOCALES.map((loc) => (
                <option key={loc} value={loc}>
                  {localeNames[loc]}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-4">
        <Button onClick={handleSave} disabled={isPending}>
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          <span className="ml-2">Save Changes</span>
        </Button>
        {saved && (
          <span className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
            <CheckCircle2 className="h-4 w-4" />
            Settings saved!
          </span>
        )}
      </div>
    </div>
  );
}

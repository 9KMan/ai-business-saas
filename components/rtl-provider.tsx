'use client';

import { useEffect, useState } from 'react';
import { isRtlLocale, type SupportedLocale } from '@/types/database';

interface RtlProviderProps {
  locale: SupportedLocale;
  children: React.ReactNode;
}

export function RtlProvider({ locale, children }: RtlProviderProps) {
  const [dir, setDir] = useState<'ltr' | 'rtl'>('ltr');

  useEffect(() => {
    setDir(isRtlLocale(locale) ? 'rtl' : 'ltr');
    document.documentElement.dir = isRtlLocale(locale) ? 'rtl' : 'ltr';
    document.documentElement.lang = locale;
  }, [locale]);

  return <div dir={dir}>{children}</div>;
}

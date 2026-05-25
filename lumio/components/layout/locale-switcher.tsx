'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function switchLocale(newLocale: string) {
    const pathWithoutLocale = pathname.replace(/^\/(en|fr)/, '') || '/';
    router.push(newLocale === 'en' ? pathWithoutLocale : `/${newLocale}${pathWithoutLocale}`);
  }

  return (
    <div className="flex items-center gap-1">
      {(['en', 'fr'] as const).map((l) => (
        <button
          key={l}
          onClick={() => switchLocale(l)}
          aria-label={`Switch to ${l === 'en' ? 'English' : 'French'}`}
          aria-pressed={locale === l}
          className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
            locale === l ? 'bg-brand-500 text-white' : 'hover:bg-muted'
          }`}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

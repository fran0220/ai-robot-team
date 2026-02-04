'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: string) => {
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=31536000`;
    router.push(newPath);
  };

  return (
    <div className="flex items-center gap-1">
      <Globe className="w-4 h-4 text-mc-text-secondary" />
      <button
        onClick={() => switchLocale('en')}
        className={`px-2 py-1 text-sm rounded ${locale === 'en' ? 'bg-mc-accent text-mc-bg' : 'text-mc-text-secondary hover:text-mc-text'}`}
      >
        EN
      </button>
      <button
        onClick={() => switchLocale('zh')}
        className={`px-2 py-1 text-sm rounded ${locale === 'zh' ? 'bg-mc-accent text-mc-bg' : 'text-mc-text-secondary hover:text-mc-text'}`}
      >
        中文
      </button>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { LayoutDashboard, FolderOpen } from 'lucide-react';

interface WorkspaceTabsProps {
  slug: string;
}

export function WorkspaceTabs({ slug }: WorkspaceTabsProps) {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations('workspace');

  const tabs = [
    { id: 'board', label: t('board'), icon: LayoutDashboard, href: '' },
    { id: 'assets', label: t('assets'), icon: FolderOpen, href: '/assets' },
  ];

  const getActiveTab = () => {
    if (pathname.includes('/assets')) return 'assets';
    return 'board';
  };

  const activeTab = getActiveTab();

  return (
    <div className="bg-mc-bg-secondary border-b border-mc-border">
      <div className="flex items-center gap-1 px-4">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          const href = `/${locale}/workspace/${slug}${tab.href}`;

          return (
            <Link
              key={tab.id}
              href={href}
              className={`
                flex items-center gap-2 px-4 py-3 text-sm font-medium
                border-b-2 transition-colors
                ${isActive
                  ? 'border-mc-accent text-mc-accent'
                  : 'border-transparent text-mc-text-secondary hover:text-mc-text hover:border-mc-border'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

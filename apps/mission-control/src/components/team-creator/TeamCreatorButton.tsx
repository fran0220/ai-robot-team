'use client';

import { MessageSquarePlus } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface Props {
  onClick: () => void;
}

export function TeamCreatorButton({ onClick }: Props) {
  const t = useTranslations('teamCreator');

  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-mc-accent to-purple-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 z-40"
      title={t('floatingButton')}
    >
      <MessageSquarePlus className="w-5 h-5" />
      <span className="font-medium hidden sm:inline">{t('floatingButton')}</span>
    </button>
  );
}

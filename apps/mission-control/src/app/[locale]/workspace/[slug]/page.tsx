import { redirect } from 'next/navigation';

interface WorkspacePageProps {
  params: Promise<{ slug: string; locale: string }>;
}

export default async function WorkspacePage({ params }: WorkspacePageProps) {
  const { slug, locale } = await params;
  redirect(`/${locale}/workspace/${slug}/board`);
}

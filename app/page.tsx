import type { Metadata } from 'next';
import PortfolioBuilder from '@/components/form/PortfolioBuilder';
import { LandingPage } from '@/components/landing/LandingPage';

export const metadata: Metadata = {
  title: 'Portlyfolio | A place for your best work',
  description: 'Build and publish a portfolio for your projects, experience, and skills. Give your work a link of its own.',
};

type HomeProps = {
  searchParams: Promise<{ create?: string | string[]; edit?: string | string[] }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const { create, edit } = await searchParams;
  const editUsername = Array.isArray(edit) ? edit[0] : edit;
  const createRequested = Array.isArray(create) ? create[0] === '1' : create === '1';

  if (createRequested || editUsername !== undefined) {
    return <PortfolioBuilder key={editUsername || 'create'} editUsername={editUsername || null} />;
  }

  return <LandingPage />;
}

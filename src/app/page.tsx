"use client";

import { CampaignEditor } from '@/components/campaign';
import { CampaignProvider } from '@/contexts/campaign-context';

export default function Home() {
  return (
    <CampaignProvider>
      <main className="min-h-screen bg-slate-50">
        <CampaignEditor />
      </main>
    </CampaignProvider>
  );
}

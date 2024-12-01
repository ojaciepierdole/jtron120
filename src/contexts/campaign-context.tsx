'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Campaign, Offer } from '@/types/campaign';

interface CampaignContextType {
  activeCampaign: Campaign | null;
  setActiveCampaign: (campaign: Campaign | null) => void;
  updateOfferOrder: (newOrder: string[]) => void;
}

const CampaignContext = createContext<CampaignContextType | undefined>(undefined);

export function CampaignProvider({ children }: { children: React.ReactNode }) {
  const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(null);

  const updateOfferOrder = useCallback((newOrder: string[]) => {
    if (!activeCampaign) return;

    setActiveCampaign(prev => {
      if (!prev) return null;
      
      // Tworzymy nowy obiekt offers zachowując kolejność z newOrder
      const orderedOffers = newOrder.reduce((acc, id) => {
        if (prev.campaignMetadata.offers[id]) {
          acc[id] = prev.campaignMetadata.offers[id];
        }
        return acc;
      }, {} as Record<string, Offer[]>);

      return {
        ...prev,
        campaignMetadata: {
          ...prev.campaignMetadata,
          offers: orderedOffers
        }
      };
    });
  }, [activeCampaign]);

  return (
    <CampaignContext.Provider value={{ activeCampaign, setActiveCampaign, updateOfferOrder }}>
      {children}
    </CampaignContext.Provider>
  );
}

export function useCampaignContext() {
  const context = useContext(CampaignContext);
  if (context === undefined) {
    throw new Error('useCampaignContext must be used within a CampaignProvider');
  }
  return context;
} 
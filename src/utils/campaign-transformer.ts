import type { Campaign, Offer, SmallBenefit, LargeBenefit } from '@/types/campaign';

interface PublicisData {
  campaignMetadata: {
    campaignId: string;
    offers: Record<string, Array<{
      id: string;
      promotionId: string;
      offerMetadata: {
        campaignTitle: string;
        smallBenefits: Record<string, { text: string; icon?: string }>;
        largeBenefits: Record<string, { title: string; description: string; icon?: string }>;
        offerGuarantee: string;
      };
    }>>;
  };
}

export function transformPublicisData(jsonData: PublicisData): Campaign {
  const transformedOffers: Record<string, Offer[]> = {};
  
  Object.values(jsonData.campaignMetadata.offers).forEach(offerArray => {
    offerArray.forEach(offer => {
      const smallBenefits = Object.entries(offer.offerMetadata.smallBenefits)
        .map(([id, benefit]): SmallBenefit => ({
          id,
          text: benefit.text,
          icon: benefit.icon
        }));

      const largeBenefits = Object.entries(offer.offerMetadata.largeBenefits)
        .map(([id, benefit]): LargeBenefit => ({
          id,
          title: benefit.title,
          description: benefit.description,
          icon: benefit.icon
        }));

      const transformedOffer: Offer = {
        id: offer.id,
        name: offer.id,
        promotionId: offer.promotionId,
        offerMetadata: {
          ...offer.offerMetadata,
          smallBenefits,
          largeBenefits
        }
      };

      transformedOffers[offer.id] = [transformedOffer];
    });
  });

  return {
    campaignMetadata: {
      campaignId: jsonData.campaignMetadata.campaignId,
      offers: transformedOffers
    }
  };
}

export function transformToPublicisFormat(campaign: Campaign): PublicisData {
  const transformedOffers: Record<string, Array<{
    id: string;
    promotionId: string;
    offerMetadata: any;
  }>> = {};

  Object.values(campaign.campaignMetadata.offers).forEach(offerArray => {
    const offer = offerArray[0];
    
    const smallBenefits = offer.offerMetadata.smallBenefits.reduce((acc, benefit, index) => ({
      ...acc,
      [`benefit${index + 1}`]: {
        text: benefit.text,
        icon: benefit.icon
      }
    }), {});

    const largeBenefits = offer.offerMetadata.largeBenefits.reduce((acc, benefit, index) => ({
      ...acc,
      [`benefit${index + 1}`]: {
        title: benefit.title,
        description: benefit.description,
        icon: benefit.icon
      }
    }), {});

    transformedOffers[offer.id] = [{
      id: offer.id,
      promotionId: offer.promotionId,
      offerMetadata: {
        ...offer.offerMetadata,
        smallBenefits,
        largeBenefits
      }
    }];
  });

  return {
    campaignMetadata: {
      campaignId: campaign.campaignMetadata.campaignId,
      offers: transformedOffers
    }
  };
} 
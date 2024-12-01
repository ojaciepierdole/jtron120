export interface SmallBenefit {
  id: string;
  text: string;
  icon?: string;
}

export interface LargeBenefit {
  id: string;
  title: string;
  description: string;
  icon?: string;
}

export interface OfferMetadata {
  campaignTitle: string;
  smallBenefits: SmallBenefit[];
  largeBenefits: LargeBenefit[];
  offerGuarantee: string;
}

export interface Offer {
  id: string;
  name: string;
  promotionId: string;
  offerMetadata: OfferMetadata;
}

export interface Campaign {
  campaignMetadata: {
    campaignId: string;
    offers: Record<string, Offer[]>;
  };
} 
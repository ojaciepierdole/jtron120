export interface SmallBenefit {
  text: string;
  icon: string;
}

export interface LargeBenefit {
  title: string;
  description: string;
  icon: string;
}

export interface OfferMetadata {
  campaignTitle: string;
  smallBenefits: {
    benefit1: SmallBenefit;
    benefit2: SmallBenefit;
    benefit3: SmallBenefit;
    benefit4: SmallBenefit;
  };
  largeBenefits: {
    benefit1: LargeBenefit;
    benefit2: LargeBenefit;
    benefit3: LargeBenefit;
    benefit4: LargeBenefit;
  };
  offerGuarantee: string;
}

export interface Offer {
  id: string;
  promotionId: string;
  offerMetadata: OfferMetadata;
}

export interface Campaign {
  campaignMetadata: {
    campaignId: string;
    offers: {
      [key: string]: Offer[];
    };
  };
} 
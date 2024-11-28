import { Campaign, Offer, OfferMetadata } from '../types/campaign';
import Papa from 'papaparse';

interface CSVOffer {
  id: string;
  sfname: string;
  name: string;
  tariff: string;
  title_pl: string;
  period: string;
  cashback: string;
  fee: string;
}

export const parseCSV = (csvContent: string): CSVOffer[] => {
  const { data } = Papa.parse(csvContent, {
    header: true,
    delimiter: ';',
    skipEmptyLines: true
  });
  return data as CSVOffer[];
};

const generateBenefits = (offer: CSVOffer) => {
  const isFixed = offer.period !== '\\N';
  const period = isFixed ? offer.period : '';
  const cashback = parseFloat(offer.cashback || '0');

  return {
    smallBenefits: {
      benefit1: {
        text: isFixed ? `Zamrożona cena przez ${period} miesięcy` : 'Cena monitorowana i dostosowana do rynku',
        icon: 'Shield'
      },
      benefit2: {
        text: `${cashback} zł nadpłaty na koncie na start`,
        icon: 'Wallet'
      },
      benefit3: {
        text: `od ${offer.fee} zł opłaty handlowej przy e-fakturze i zgodach marketingowych`,
        icon: 'Receipt'
      },
      benefit4: {
        text: '100% zielonej energii',
        icon: 'Leaf'
      }
    },
    largeBenefits: {
      benefit1: {
        title: isFixed ? `Stała cena za kWh przez ${period} miesięcy` : 'Zawsze najlepsza cena za prąd',
        description: isFixed ? 'Ochrona przed podwyżkami cen prądu' : 'Dbamy o najlepszą cenę za Ciebie i automatycznie ją dostosowujemy',
        icon: 'Shield'
      },
      benefit2: {
        title: 'Umowa na czas nieoznaczony',
        description: 'Umowa na czas nieoznaczony z miesięcznym okresem wypowiedzenia',
        icon: 'FileText'
      },
      benefit3: {
        title: `${cashback} zł na start`,
        description: 'Oszczędności od pierwszego rachunku',
        icon: 'Wallet'
      },
      benefit4: {
        title: '100% zielonej energii',
        description: 'Energia w całości pochodząca z odnawialnych źródeł',
        icon: 'Leaf'
      }
    },
    offerGuarantee: isFixed ? `Gwarancja stałej ceny przez ${period} miesięcy` : 'Zawsze najlepsza cena na rynku'
  };
};

export const generateCampaign = (csvOffers: CSVOffer[]): Campaign => {
  const offers = csvOffers.reduce((acc, csvOffer) => {
    const offer: Offer = {
      id: csvOffer.id,
      promotionId: csvOffer.name,
      offerMetadata: {
        campaignTitle: "Oferta Partnerska Publicis",
        ...generateBenefits(csvOffer)
      }
    };

    if (!acc[csvOffer.id]) {
      acc[csvOffer.id] = [];
    }
    acc[csvOffer.id].push(offer);
    return acc;
  }, {} as Record<string, Offer[]>);

  return {
    campaignMetadata: {
      campaignId: "PARTNER2024",
      offers
    }
  };
}; 
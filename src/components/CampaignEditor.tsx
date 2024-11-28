"use client";

import React, { useState, useRef } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Campaign, Offer, SmallBenefit, LargeBenefit } from '../types/campaign';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Terminal, RotateCcw, GripVertical, CornerDownLeft } from "lucide-react";

interface BenefitEditorProps {
  benefit: SmallBenefit | LargeBenefit;
  onChange: (benefit: SmallBenefit | LargeBenefit) => void;
  isLarge?: boolean;
}

const BenefitEditor: React.FC<BenefitEditorProps> = ({ benefit, onChange, isLarge = false }) => {
  return (
    <div className="w-full space-y-2">
      {isLarge ? (
        <>
          <div>
            <Label className="font-semibold mb-1.5 block">Tytuł</Label>
            <Input
              type="text"
              value={(benefit as LargeBenefit).title}
              onChange={(e) => onChange({ ...benefit, title: e.target.value } as LargeBenefit)}
              placeholder="Tytuł"
              className="text-left w-full"
            />
          </div>
          <div>
            <Label className="font-semibold mb-1.5 block">Opis</Label>
            <Input
              type="text"
              value={(benefit as LargeBenefit).description}
              onChange={(e) => onChange({ ...benefit, description: e.target.value } as LargeBenefit)}
              placeholder="Opis"
              className="text-left w-full"
            />
          </div>
        </>
      ) : (
        <Input
          type="text"
          value={(benefit as SmallBenefit).text}
          onChange={(e) => onChange({ ...benefit, text: e.target.value } as SmallBenefit)}
          placeholder="Tekst benefitu"
          className="text-left w-full"
        />
      )}
    </div>
  );
};

interface BenefitSectionProps {
  title: string;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  children: React.ReactNode;
}

const BenefitSection: React.FC<BenefitSectionProps> = ({ title, enabled, onToggle, children }) => (
  <Card className={enabled ? '' : 'bg-muted'}>
    <CardHeader className="pb-3">
      <div className="flex items-center justify-between">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        <div className="flex items-center space-x-2">
          <Label htmlFor={`${title}-toggle`} className="text-sm text-slate-500">
            {enabled ? 'Aktywna' : 'Nieaktywna'}
          </Label>
          <Switch
            id={`${title}-toggle`}
            checked={enabled}
            onCheckedChange={onToggle}
          />
        </div>
      </div>
    </CardHeader>
    <CardContent className={!enabled ? 'opacity-50 pointer-events-none' : ''}>
      {children}
    </CardContent>
  </Card>
);

interface OfferDisplayProps {
  offer: Offer;
  onToggle: (id: string, enabled: boolean) => void;
  onUpdate: (id: string, updatedOffer: Offer) => void;
  enabled: boolean;
}

const OfferDisplay: React.FC<OfferDisplayProps> = ({ offer, onToggle, onUpdate, enabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditingId, setIsEditingId] = useState(false);
  const [editedId, setEditedId] = useState(offer.id);
  const [smallBenefitsEnabled, setSmallBenefitsEnabled] = useState(true);
  const [largeBenefitsEnabled, setLargeBenefitsEnabled] = useState(true);

  const updateOfferMetadata = (updates: Partial<Offer['offerMetadata']>) => {
    onUpdate(offer.id, {
      ...offer,
      offerMetadata: {
        ...offer.offerMetadata,
        ...updates
      }
    });
  };

  const reorderBenefits = (items: Record<string, any>, startIndex: number, endIndex: number) => {
    const result = {};
    const keys = Object.keys(items);
    const [removed] = keys.splice(startIndex, 1);
    keys.splice(endIndex, 0, removed);
    keys.forEach(key => {
      result[key] = items[key];
    });
    return result;
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const type = result.droppableId.includes('small') ? 'small' : 'large';
    const items = type === 'small' ? offer.offerMetadata.smallBenefits : offer.offerMetadata.largeBenefits;
    const reordered = reorderBenefits(
      items,
      result.source.index,
      result.destination.index
    );

    if (type === 'small') {
      updateOfferMetadata({ smallBenefits: reordered });
    } else {
      updateOfferMetadata({ largeBenefits: reordered });
    }
  };

  const handleIdSubmit = () => {
    onUpdate(offer.id, {
      ...offer,
      id: editedId
    });
    setIsEditingId(false);
  };

  return (
    <div className={`border border-slate-200 rounded-lg shadow-sm ${enabled ? 'bg-white' : 'bg-muted'}`}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="p-4 flex items-center justify-between">
          <CollapsibleTrigger className="flex items-center text-left flex-1">
            <span className={`transform transition-transform ${isOpen ? 'rotate-90' : ''} mr-2 text-slate-400`}>
              ▶
            </span>
            <div className="flex-1 flex items-center gap-2">
              <div className={`font-medium ${enabled ? 'text-slate-900' : 'text-slate-500'}`}>
                {isEditingId ? (
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleIdSubmit();
                    }}
                    className="inline-flex items-center gap-1"
                  >
                    <Input
                      type="text"
                      value={editedId}
                      onChange={(e) => setEditedId(e.target.value)}
                      className="w-24 h-7 text-sm"
                      autoFocus
                      onBlur={handleIdSubmit}
                    />
                    <CornerDownLeft className="w-4 h-4 text-slate-400" />
                  </form>
                ) : (
                  <span 
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsEditingId(true);
                    }}
                    className="cursor-pointer hover:bg-yellow-50 px-2 py-1 rounded transition-colors duration-150"
                  >
                    Oferta {offer.id}
                  </span>
                )}
              </div>
              <span className="text-sm text-slate-500">
                {isOpen ? 'Zwiń' : 'Rozwiń'}
              </span>
            </div>
          </CollapsibleTrigger>
          <div className="flex items-center space-x-4">
            <Label className="flex items-center space-x-2">
              <Switch
                checked={enabled}
                onCheckedChange={(checked) => onToggle(offer.id, checked)}
              />
              <span className={enabled ? 'text-slate-600' : 'text-slate-500'}>
                {enabled ? 'Aktywna' : 'Nieaktywna'}
              </span>
            </Label>
          </div>
        </div>

        <CollapsibleContent className={`px-4 pb-4 ${!enabled ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="border-t pt-4 space-y-6">
            <div className="grid md:grid-cols-[200px,1fr] gap-2 items-start mb-6">
              <Label className="md:text-right md:pr-4 font-semibold pt-2">Gwarancja oferty</Label>
              <Input
                type="text"
                value={offer.offerMetadata.offerGuarantee}
                onChange={(e) => updateOfferMetadata({ offerGuarantee: e.target.value })}
                className="text-left"
              />
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
              <BenefitSection
                title="Małe benefity"
                enabled={smallBenefitsEnabled}
                onToggle={setSmallBenefitsEnabled}
              >
                <Droppable droppableId={`small-benefits-${offer.id}`}>
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps} className="grid gap-4">
                      {Object.entries(offer.offerMetadata.smallBenefits).map(([key, benefit], index) => (
                        <Draggable key={key} draggableId={`${offer.id}-small-${key}`} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`relative ${snapshot.isDragging ? 'z-50' : ''}`}
                            >
                              <div className="flex items-center gap-2">
                                <div {...provided.dragHandleProps} className="cursor-grab">
                                  <GripVertical className="w-4 h-4 text-slate-400" />
                                </div>
                                <div className="flex-1">
                                  <Label className="font-semibold text-slate-900 mb-2 block">
                                    Benefit {index + 1}
                                  </Label>
                                  <BenefitEditor
                                    benefit={benefit}
                                    onChange={(updatedBenefit) => {
                                      updateOfferMetadata({
                                        smallBenefits: {
                                          ...offer.offerMetadata.smallBenefits,
                                          [key]: updatedBenefit as SmallBenefit
                                        }
                                      });
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </BenefitSection>

              <BenefitSection
                title="Duże benefity"
                enabled={largeBenefitsEnabled}
                onToggle={setLargeBenefitsEnabled}
              >
                <Droppable droppableId={`large-benefits-${offer.id}`}>
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps} className="grid gap-4">
                      {Object.entries(offer.offerMetadata.largeBenefits)
                        .filter((_, index) => index < 3)
                        .map(([key, benefit], index) => (
                          <Draggable key={key} draggableId={`${offer.id}-large-${key}`} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`relative ${snapshot.isDragging ? 'z-50' : ''}`}
                              >
                                <div className="flex items-center gap-2">
                                  <div {...provided.dragHandleProps} className="cursor-grab">
                                    <GripVertical className="w-4 h-4 text-slate-400" />
                                  </div>
                                  <div className="flex-1">
                                    <Label className="font-semibold text-slate-900 mb-2 block">
                                      Benefit {index + 1}:
                                    </Label>
                                    <BenefitEditor
                                      benefit={benefit}
                                      onChange={(updatedBenefit) => {
                                        updateOfferMetadata({
                                          largeBenefits: {
                                            ...offer.offerMetadata.largeBenefits,
                                            [key]: updatedBenefit as LargeBenefit
                                          }
                                        });
                                      }}
                                      isLarge
                                    />
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </BenefitSection>
            </DragDropContext>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export const CampaignEditor: React.FC = () => {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [enabledOffers, setEnabledOffers] = useState<Set<string>>(new Set());
  const [copySuccess, setCopySuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const jsonRef = useRef<HTMLPreElement>(null);

  const validateCampaignData = (data: any): data is Campaign => {
    return (
      data &&
      typeof data === 'object' &&
      'campaignMetadata' in data &&
      typeof data.campaignMetadata === 'object' &&
      'offers' in data.campaignMetadata &&
      typeof data.campaignMetadata.offers === 'object'
    );
  };

  const handleJSONUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setError(null);

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const campaignData = JSON.parse(content);
          
          if (!validateCampaignData(campaignData)) {
            throw new Error('Nieprawidłowa struktura pliku JSON');
          }

          setCampaign(campaignData);
          
          // Enable all offers by default
          const offerIds = new Set<string>();
          Object.keys(campaignData.campaignMetadata.offers).forEach(id => {
            offerIds.add(id);
          });
          setEnabledOffers(offerIds);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Błąd podczas wczytywania pliku');
          setCampaign(null);
          setEnabledOffers(new Set());
        }
      };
      reader.onerror = () => {
        setError('Błąd podczas odczytu pliku');
      };
      reader.readAsText(file);
    }
  };

  const handleOfferToggle = (id: string, enabled: boolean) => {
    const newEnabledOffers = new Set(enabledOffers);
    if (enabled) {
      newEnabledOffers.add(id);
    } else {
      newEnabledOffers.delete(id);
    }
    setEnabledOffers(newEnabledOffers);
  };

  const handleOfferUpdate = (id: string, updatedOffer: Offer) => {
    if (!campaign) return;

    setCampaign({
      ...campaign,
      campaignMetadata: {
        ...campaign.campaignMetadata,
        offers: {
          ...campaign.campaignMetadata.offers,
          [id]: [updatedOffer]
        }
      }
    });
  };

  const updateCampaignId = (newId: string) => {
    if (!campaign) return;

    setCampaign({
      ...campaign,
      campaignMetadata: {
        ...campaign.campaignMetadata,
        campaignId: newId
      }
    });
  };

  const updateCampaignTitle = (newTitle: string) => {
    if (!campaign) return;

    const updatedOffers = Object.entries(campaign.campaignMetadata.offers).reduce(
      (acc, [id, offers]) => ({
        ...acc,
        [id]: offers.map(offer => ({
          ...offer,
          offerMetadata: {
            ...offer.offerMetadata,
            campaignTitle: newTitle
          }
        }))
      }),
      {}
    );

    setCampaign({
      ...campaign,
      campaignMetadata: {
        ...campaign.campaignMetadata,
        offers: updatedOffers
      }
    });
  };

  const getFilteredCampaign = (): string => {
    if (!campaign) return '';
    
    // Filtrujemy tylko aktywne oferty
    const filteredCampaign = {
      ...campaign,
      campaignMetadata: {
        ...campaign.campaignMetadata,
        offers: Object.entries(campaign.campaignMetadata.offers)
          .filter(([id]) => enabledOffers.has(id)) // Tylko aktywne oferty
          .reduce((acc, [id, offers]) => {
            acc[id] = offers;
            return acc;
          }, {} as Record<string, Offer[]>)
      }
    };

    return JSON.stringify(filteredCampaign, null, 2);
  };

  const copyToClipboard = () => {
    if (jsonRef.current) {
      const range = document.createRange();
      range.selectNode(jsonRef.current);
      window.getSelection()?.removeAllRanges();
      window.getSelection()?.addRange(range);
      document.execCommand('copy');
      window.getSelection()?.removeAllRanges();
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const resetToOriginal = () => {
    if (!campaign) return;
    
    try {
      // Resetujemy do oryginalnego stanu poprzez re-parse aktualnego JSON
      const originalState = JSON.parse(JSON.stringify(campaign));
      setCampaign(originalState);
      
      // Włączamy wszystkie oferty
      const offerIds = new Set<string>();
      Object.keys(originalState.campaignMetadata.offers).forEach(id => {
        offerIds.add(id);
      });
      setEnabledOffers(offerIds);
      
    } catch (err) {
      setError('Błąd podczas resetowania stanu');
    }
  };

  const handleOffersReorder = (result: DropResult) => {
    if (!result.destination || !campaign) return;

    const offerIds = Object.keys(campaign.campaignMetadata.offers);
    const [movedId] = offerIds.splice(result.source.index, 1);
    offerIds.splice(result.destination.index, 0, movedId);

    const reorderedOffers = offerIds.reduce((acc, id) => {
      acc[id] = campaign.campaignMetadata.offers[id];
      return acc;
    }, {} as Record<string, Offer[]>);

    setCampaign({
      ...campaign,
      campaignMetadata: {
        ...campaign.campaignMetadata,
        offers: reorderedOffers
      }
    });
  };

  const addNewOffer = () => {
    if (!campaign) return;

    const newId = String(Math.max(...Object.keys(campaign.campaignMetadata.offers).map(Number)) + 1);
    const templateOffer = Object.values(campaign.campaignMetadata.offers)[0][0];
    
    setCampaign({
      ...campaign,
      campaignMetadata: {
        ...campaign.campaignMetadata,
        offers: {
          ...campaign.campaignMetadata.offers,
          [newId]: [{
            ...templateOffer,
            id: newId,
          }]
        }
      }
    });

    setEnabledOffers(new Set([...enabledOffers, newId]));
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-slate-900 text-white py-6 mb-8 border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center space-x-3">
            <Terminal className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold tracking-tight">JSON-9000 TRON</h1>
              <p className="text-slate-400 text-sm">Edytor kampanii marketingowych</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-12">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <Label className="text-slate-600">Plik JSON kampanii</Label>
            {campaign && (
              <Button
                onClick={resetToOriginal}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Resetuj zmiany
              </Button>
            )}
          </div>
          <div className="mt-2">
            <Input
              type="file"
              accept=".json"
              onChange={handleJSONUpload}
              className="bg-white"
            />
          </div>
          {error && (
            <p className="text-red-500 text-sm mt-2">{error}</p>
          )}
        </div>

        {campaign && (
          <>
            <div className="mb-8 p-6 border rounded-lg bg-white shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                Ustawienia kampanii
              </h2>
              <div className="grid gap-4">
                <div>
                  <Label className="text-slate-600">ID Kampanii</Label>
                  <Input
                    type="text"
                    value={campaign.campaignMetadata.campaignId}
                    onChange={(e) => updateCampaignId(e.target.value)}
                    className="font-mono mt-1.5"
                  />
                </div>
                <div>
                  <Label className="text-slate-600">Tytuł kampanii</Label>
                  <Input
                    type="text"
                    value={campaign.campaignMetadata.offers[Object.keys(campaign.campaignMetadata.offers)[0]][0].offerMetadata.campaignTitle}
                    onChange={(e) => updateCampaignTitle(e.target.value)}
                    className="mt-1.5"
                  />
                </div>
              </div>
            </div>

            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-slate-900 flex items-center">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span>
                  Dostępne oferty
                </h2>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-slate-500">
                    Aktywne oferty: {enabledOffers.size} z {Object.keys(campaign.campaignMetadata.offers).length}
                  </div>
                  <Button
                    onClick={addNewOffer}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    + Dodaj ofertę
                  </Button>
                </div>
              </div>
              <DragDropContext onDragEnd={handleOffersReorder}>
                <Droppable droppableId="offers">
                  {(provided) => (
                    <div 
                      ref={provided.innerRef} 
                      {...provided.droppableProps}
                      className="space-y-3"
                    >
                      {Object.entries(campaign.campaignMetadata.offers).map(([id, offers], index) => (
                        <Draggable key={id} draggableId={id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`
                                group relative 
                                ${snapshot.isDragging ? 'z-50 ring-2 ring-blue-500 rounded-lg shadow-lg' : ''}
                              `}
                            >
                              <div
                                {...provided.dragHandleProps}
                                className="absolute left-0 top-0 bottom-0 w-8 flex items-center justify-center cursor-grab 
                                         opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <GripVertical className="w-4 h-4 text-slate-400" />
                              </div>
                              <div className="pl-8">
                                <OfferDisplay
                                  offer={offers[0]}
                                  onToggle={handleOfferToggle}
                                  onUpdate={handleOfferUpdate}
                                  enabled={enabledOffers.has(id)}
                                />
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>

            <div>
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-semibold text-slate-900 flex items-center">
                  <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2"></span>
                  Wygenerowany JSON
                </h2>
                <Button
                  onClick={copyToClipboard}
                  variant="default"
                  className="bg-slate-900 hover:bg-slate-800"
                >
                  {copySuccess ? 'Skopiowano!' : 'Kopiuj JSON'}
                </Button>
              </div>
              <pre
                ref={jsonRef}
                className="bg-slate-900 text-slate-50 p-6 rounded-lg overflow-auto max-h-96 text-sm font-mono"
              >
                {getFilteredCampaign()}
              </pre>
            </div>
          </>
        )}
      </div>
    </div>
  );
}; 
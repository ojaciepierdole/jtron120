'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Terminal, RotateCcw, GripVertical, CornerDownLeft } from "lucide-react";
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
import { useCampaignContext } from '@/contexts/campaign-context';
import { logger } from '@/utils/logger';
import type { Campaign, Offer, SmallBenefit, LargeBenefit } from '@/types/campaign';

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

export function CampaignEditor() {
  const { activeCampaign, setActiveCampaign, updateOfferOrder } = useCampaignContext();
  const [enabledOffers, setEnabledOffers] = useState<Set<string>>(new Set());
  const [editingOfferId, setEditingOfferId] = useState<string | null>(null);
  const [offerOrder, setOfferOrder] = useState<string[]>([]);
  const [isAddingNewOffer, setIsAddingNewOffer] = useState(false);
  const jsonRef = useRef<HTMLPreElement>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    if (activeCampaign && offerOrder.length === 0) {
      const initialOrder = Object.keys(activeCampaign.campaignMetadata.offers);
      setOfferOrder(initialOrder);
      setEnabledOffers(new Set(initialOrder));
    }
  }, [activeCampaign]);

  const handleOfferNameChange = useCallback((oldId: string, newId: string) => {
    if (!activeCampaign || !activeCampaign.campaignMetadata.offers[oldId]) return;
    if (oldId === newId) {
      setEditingOfferId(null);
      return;
    }

    const newOffers = { ...activeCampaign.campaignMetadata.offers };
    const offerData = newOffers[oldId];
    
    delete newOffers[oldId];
    newOffers[newId] = [{
      ...offerData[0],
      id: newId
    }];

    const newOrder = offerOrder.map(id => id === oldId ? newId : id);
    setOfferOrder(newOrder);

    setActiveCampaign({
      ...activeCampaign,
      campaignMetadata: {
        ...activeCampaign.campaignMetadata,
        offers: newOffers
      }
    });

    const newEnabled = new Set(enabledOffers);
    if (newEnabled.has(oldId)) {
      newEnabled.delete(oldId);
      newEnabled.add(newId);
    }
    setEnabledOffers(newEnabled);
    setEditingOfferId(null);
  }, [activeCampaign, setActiveCampaign, offerOrder, enabledOffers]);

  const handleDragEnd = useCallback((result: DropResult) => {
    if (!result.destination || !activeCampaign) return;

    const { source, destination } = result;

    if (result.type === 'OFFERS') {
      const newOrder = Array.from(offerOrder);
      const [removed] = newOrder.splice(source.index, 1);
      newOrder.splice(destination.index, 0, removed);
      
      setOfferOrder(newOrder);
      updateOfferOrder(newOrder);
    }
  }, [activeCampaign, offerOrder, updateOfferOrder]);

  const addNewOffer = useCallback(() => {
    if (!activeCampaign || isAddingNewOffer) return;

    const tempId = '_new_offer_';
    const templateOffer = Object.values(activeCampaign.campaignMetadata.offers)[0]?.[0] || {
      id: tempId,
      promotionId: '',
      offerMetadata: {
        campaignTitle: activeCampaign.campaignMetadata.campaignId,
        smallBenefits: [
          { id: 'benefit1', text: 'Nowy benefit', icon: 'Star' },
          { id: 'benefit2', text: 'Nowy benefit', icon: 'Star' },
          { id: 'benefit3', text: 'Nowy benefit', icon: 'Star' },
          { id: 'benefit4', text: 'Nowy benefit', icon: 'Star' }
        ],
        largeBenefits: [
          { id: 'benefit1', title: 'Nowy benefit', description: 'Opis benefitu', icon: 'Star' },
          { id: 'benefit2', title: 'Nowy benefit', description: 'Opis benefitu', icon: 'Star' },
          { id: 'benefit3', title: 'Nowy benefit', description: 'Opis benefitu', icon: 'Star' },
          { id: 'benefit4', title: 'Nowy benefit', description: 'Opis benefitu', icon: 'Star' }
        ],
        offerGuarantee: 'Nowa gwarancja'
      }
    };

    const newOffer = {
      ...templateOffer,
      id: tempId,
      name: ''
    };

    setActiveCampaign({
      ...activeCampaign,
      campaignMetadata: {
        ...activeCampaign.campaignMetadata,
        offers: {
          ...activeCampaign.campaignMetadata.offers,
          [tempId]: [newOffer]
        }
      }
    });

    setEditingOfferId(tempId);
    setIsAddingNewOffer(true);
  }, [activeCampaign, setActiveCampaign, isAddingNewOffer]);

  const handleJSONUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const data = JSON.parse(content);
          setActiveCampaign(data);
          setEnabledOffers(new Set(Object.keys(data.campaignMetadata.offers)));
        } catch (error) {
          logger.error('Failed to parse JSON file', error);
        }
      };
      reader.readAsText(file);
    }
  }, [setActiveCampaign]);

  const resetToOriginal = useCallback(() => {
    if (!activeCampaign) return;
    const originalState = JSON.parse(JSON.stringify(activeCampaign));
    setActiveCampaign(originalState);
    setEnabledOffers(new Set(Object.keys(originalState.campaignMetadata.offers)));
  }, [activeCampaign, setActiveCampaign]);

  const getFilteredCampaign = useCallback(() => {
    if (!activeCampaign) return '';

    const orderedOffers = offerOrder
      .filter(id => enabledOffers.has(id))
      .reduce((acc, id) => {
        if (activeCampaign.campaignMetadata.offers[id]) {
          acc[id] = activeCampaign.campaignMetadata.offers[id];
        }
        return acc;
      }, {} as Record<string, Offer[]>);

    return JSON.stringify({
      ...activeCampaign,
      campaignMetadata: {
        ...activeCampaign.campaignMetadata,
        offers: orderedOffers
      }
    }, null, 2);
  }, [activeCampaign, enabledOffers, offerOrder]);

  const copyToClipboard = useCallback(() => {
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
  }, []);

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
            {activeCampaign && (
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
        </div>

        {activeCampaign && (
          <>
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-slate-900 flex items-center">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span>
                  Dostępne oferty
                </h2>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-slate-500">
                    Aktywne oferty: {enabledOffers.size} z {Object.keys(activeCampaign.campaignMetadata.offers).length}
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

              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="offers-list" type="OFFERS">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                      {offerOrder.map((offerId, index) => {
                        const offerArray = activeCampaign?.campaignMetadata.offers[offerId];
                        if (!offerArray) return null;
                        const offer = offerArray[0];
                        const isEditing = editingOfferId === offerId;

                        return (
                          <Draggable key={offerId} draggableId={offerId} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className="group relative"
                              >
                                <div
                                  {...provided.dragHandleProps}
                                  className="absolute left-0 top-0 bottom-0 w-8 flex items-center justify-center cursor-grab 
                                           opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <GripVertical className="w-4 h-4 text-slate-400" />
                                </div>
                                <div className="pl-8">
                                  <Collapsible>
                                    <div className="p-4 border rounded-lg bg-white">
                                      <div className="flex items-center gap-2">
                                        <CollapsibleTrigger className="flex-1 text-left">
                                          {isEditing ? (
                                            <form
                                              onSubmit={(e) => {
                                                e.preventDefault();
                                                const input = e.currentTarget.querySelector('input');
                                                if (input) {
                                                  handleOfferNameChange(offerId, input.value);
                                                }
                                              }}
                                              className="flex items-center gap-2"
                                            >
                                              <Input
                                                autoFocus
                                                defaultValue={offerId}
                                                onBlur={(e) => handleOfferNameChange(offerId, e.target.value)}
                                              />
                                              <CornerDownLeft className="h-4 w-4 text-gray-500" />
                                            </form>
                                          ) : (
                                            <div
                                              onClick={() => setEditingOfferId(offerId)}
                                              className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
                                            >
                                              Oferta {offerId}
                                            </div>
                                          )}
                                        </CollapsibleTrigger>
                                        <Switch
                                          checked={enabledOffers.has(offerId)}
                                          onCheckedChange={(checked) => {
                                            const newEnabled = new Set(enabledOffers);
                                            if (checked) newEnabled.add(offerId);
                                            else newEnabled.delete(offerId);
                                            setEnabledOffers(newEnabled);
                                          }}
                                        />
                                      </div>
                                      <CollapsibleContent>
                                        {/* Tu dodaj edycję benefitów */}
                                      </CollapsibleContent>
                                    </div>
                                  </Collapsible>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
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
} 
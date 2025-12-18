'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardFace } from '@/lib/types';
import { useState } from 'react';

interface CardDetailProps {
  card: Card;
}

export default function CardDetail({ card }: CardDetailProps) {
  const [currentFaceIndex, setCurrentFaceIndex] = useState(0);

  const isDoubleSided = card.card_faces && card.card_faces.length > 1;
  const currentFace = isDoubleSided && card.card_faces ? card.card_faces[currentFaceIndex] : null;
  const displayCard = currentFace || card;

  const getExternalLinks = () => {
    const cardName = encodeURIComponent(card.name);
    return {
      Scryfall: card.scryfall_uri,
      Gatherer: `https://gatherer.wizards.com/Pages/Card/Details.aspx?name=${cardName}`,
      TCGPlayer: `https://www.tcgplayer.com/search/all/product?productLineName=magic&q=${cardName}`,
      EDHREC: `https://edhrec.com/cards/${card.name.toLowerCase().replace(/ /g, '-')}`,
      Archidekt: `https://archidekt.com/cards/${card.id}`,
    };
  };

  const externalLinks = getExternalLinks();

  return (
    <div className="bg-slate-900 rounded-lg p-8 max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Card Image */}
        <div className="flex flex-col items-center gap-4">
          {displayCard.image_uris?.large && (
            <div className="relative w-full max-w-sm">
              <Image
                src={displayCard.image_uris.large}
                alt={displayCard.name}
                width={400}
                height={560}
                className="w-full h-auto rounded-lg shadow-lg"
                priority
              />
            </div>
          )}

          {isDoubleSided && card.card_faces && (
            <div className="flex gap-2">
              {card.card_faces.map((face, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentFaceIndex(index)}
                  className={`px-4 py-2 rounded transition-colors ${
                    currentFaceIndex === index
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {face.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Card Info */}
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-100 mb-2">{displayCard.name}</h1>
            <p className="text-slate-400">{displayCard.type_line}</p>
          </div>

          <div className="bg-slate-800 p-4 rounded">
            <h2 className="text-lg font-semibold text-slate-100 mb-2">Details</h2>
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-slate-400">Mana Cost:</span>{' '}
                <span className="text-slate-100">{displayCard.mana_cost || 'N/A'}</span>
              </p>
              <p>
                <span className="text-slate-400">CMC:</span>{' '}
                <span className="text-slate-100">{displayCard.cmc}</span>
              </p>
              {displayCard.power && displayCard.toughness && (
                <p>
                  <span className="text-slate-400">P/T:</span>{' '}
                  <span className="text-slate-100">
                    {displayCard.power}/{displayCard.toughness}
                  </span>
                </p>
              )}
              <p>
                <span className="text-slate-400">Set:</span>{' '}
                <span className="text-slate-100">{card.set_name}</span>
              </p>
              {card.rarity && (
                <p>
                  <span className="text-slate-400">Rarity:</span>{' '}
                  <span className="text-slate-100 capitalize">{card.rarity}</span>
                </p>
              )}
              <p>
                <span className="text-slate-400">Released:</span>{' '}
                <span className="text-slate-100">{new Date(card.released_at).toLocaleDateString()}</span>
              </p>
            </div>
          </div>

          {displayCard.oracle_text && (
            <div className="bg-slate-800 p-4 rounded">
              <h2 className="text-lg font-semibold text-slate-100 mb-2">Card Text</h2>
              <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                {displayCard.oracle_text}
              </p>
            </div>
          )}

          <div className="bg-slate-800 p-4 rounded">
            <h2 className="text-lg font-semibold text-slate-100 mb-3">External Links</h2>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(externalLinks).map(([name, url]) => (
                <a
                  key={name}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors text-center"
                >
                  {name}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

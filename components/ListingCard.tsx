"use client";

import { useState } from "react";
import { X } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase-browser";

export type Listing = {
  id: string;
  title: string;
  location: string;
  quantity: string;
  originalPrice: number | null;
  price: number;
  category: string;
  imageUrl?: string | null;
  whatsapp?: string | null;
  paysOrigine?: string | null;
  marque?: string | null;
  fournisseurNom?: string | null;
  fournisseurPhoto?: string | null;
  userId?: string | null;
};

export const codesParPays: Record<string, string> = {
  Maroc: "ma",
  Espagne: "es",
  Italie: "it",
  Turquie: "tr",
  Portugal: "pt",
  France: "fr",
  Chine: "cn",
  Inde: "in",
  Égypte: "eg",
};

function formatDH(value: number) {
  return `${value.toLocaleString("fr-FR")} DH (MAD)`;
}

function whatsappLink(phone: string, titre: string) {
  const digits = phone.replace(/[^0-9]/g, "");
  const international = digits.startsWith("0")
    ? "212" + digits.slice(1)
    : digits;
  const message = encodeURIComponent(
    `Bonjour, je suis intéressé(e) par votre annonce "${titre}" sur SoldesBTP.ma`
  );
  return `https://wa.me/${international}?text=${message}`;
}

export default function ListingCard({
  listing,
  editHref,
  onDelete,
}: {
  listing: Listing;
  editHref?: string;
  onDelete?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const supabase = createClient();

  function enregistrerClicWhatsapp() {
    if (!listing.userId) return;
    supabase
      .from("contacts_whatsapp")
      .insert({ user_id: listing.userId, listing_id: listing.id })
      .then(() => {});
  }

  const discount = listing.originalPrice
    ? Math.round(
        ((listing.originalPrice - listing.price) / listing.originalPrice) * 100
      )
    : null;

  return (
    <>
      <div className="stock-tag hover:shadow-lg transition-shadow overflow-hidden !p-0 flex flex-col">
        {listing.imageUrl && (
          <button
            onClick={() => setOpen(true)}
            className="w-full h-48 bg-white border-b-2 border-concrete flex items-center justify-center p-4 cursor-zoom-in"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={listing.imageUrl}
              alt={listing.title}
              className="max-w-full max-h-full object-contain"
            />
          </button>
        )}

        <div className="p-4 flex flex-col flex-1">
          {listing.fournisseurNom && (
            <Link
              href={`/recherche?ville=${encodeURIComponent(
                listing.location
              )}&mode=fournisseur&fournisseur=${encodeURIComponent(
                listing.fournisseurNom
              )}&collection=${encodeURIComponent(
                listing.category
              )}&tousFormats=1`}
              className="flex items-center gap-2.5 mb-3 pb-3 border-b border-concrete/10 hover:opacity-75 transition-opacity"
            >
              {listing.fournisseurPhoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={listing.fournisseurPhoto}
                  alt={listing.fournisseurNom}
                  className="w-10 h-10 rounded-full object-cover border-2 border-concrete"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-cement border-2 border-concrete" />
              )}
              <span className="font-display text-sm">
                {listing.fournisseurNom}
              </span>
            </Link>
          )}

          <div className="flex justify-between items-start mb-3">
            <span className="font-mono text-xs text-steel uppercase">
              {listing.category}
            </span>
            {discount !== null && (
              <span className="stamp !text-xs !px-1.5 !py-0.5">
                -{discount}%
              </span>
            )}
          </div>

          <h3 className="font-body font-semibold mb-1 leading-snug">
            {listing.title}
          </h3>
          {listing.paysOrigine && (
            <p className="font-body text-xs text-steel mb-1 flex items-center gap-1.5">
              {codesParPays[listing.paysOrigine] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`https://flagcdn.com/24x18/${codesParPays[listing.paysOrigine]}.png`}
                  alt={listing.paysOrigine}
                  className="inline-block w-4 h-3 object-cover"
                />
              )}
              Made in {listing.paysOrigine}
            </p>
          )}
          {listing.marque && (
            <p className="font-body text-xs text-steel mb-1">
              Marque : <span className="font-semibold">{listing.marque}</span>
            </p>
          )}
          <p className="font-mono text-xs text-steel mb-4">
            {listing.quantity} · {listing.location}
          </p>

          <div className="flex items-baseline gap-3 mb-4">
            {listing.originalPrice && (
              <span className="price-struck text-sm">
                {formatDH(listing.originalPrice)}
              </span>
            )}
            <span className="price-current text-lg">
              {formatDH(listing.price)}
            </span>
          </div>

          {listing.whatsapp && (
            <a
              href={whatsappLink(listing.whatsapp, listing.title)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={enregistrerClicWhatsapp}
              className="mt-auto text-center font-body font-semibold px-4 py-2.5 bg-safety text-concrete rounded-sm hover:bg-safety-dark transition-colors"
            >
              Réserver sur WhatsApp
            </a>
          )}

          {(editHref || onDelete) && (
            <div className="flex gap-2 mt-3">
              {editHref && (
                <a
                  href={editHref}
                  className="flex-1 text-center font-body text-sm px-3 py-2 border border-concrete/20 rounded-sm hover:border-safety hover:text-alert transition-colors"
                >
                  Modifier
                </a>
              )}
              {onDelete && (
                <button
                  type="button"
                  onClick={onDelete}
                  className="flex-1 font-body text-sm px-3 py-2 border border-alert/40 text-alert rounded-sm hover:bg-alert hover:text-white transition-colors"
                >
                  Supprimer
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {open && listing.imageUrl && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-concrete/80 z-50 flex items-center justify-center p-6"
        >
          <button
            onClick={() => setOpen(false)}
            className="absolute top-6 right-6 text-cement hover:text-safety"
          >
            <X size={32} />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={listing.imageUrl}
            alt={listing.title}
            onClick={(e) => e.stopPropagation()}
            className="max-w-full max-h-[85vh] object-contain"
          />
        </div>
      )}
    </>
  );
}

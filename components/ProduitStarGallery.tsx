"use client";

import { useState } from "react";

export default function ProduitStarGallery({
  images,
  titre,
}: {
  images: string[];
  titre: string;
}) {
  const [selected, setSelected] = useState(0);

  if (images.length === 0) return null;

  return (
    <div>
      <div className="w-full aspect-square bg-white border border-concrete/15 rounded-sm flex items-center justify-center p-6 mb-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[selected]}
          alt={titre}
          className="max-w-full max-h-full object-contain"
        />
      </div>

      {images.length > 1 && (
        <div className="flex gap-3">
          {images.map((img, i) => (
            <button
              key={img}
              type="button"
              onClick={() => setSelected(i)}
              className={`w-20 h-20 bg-white border rounded-sm p-1 flex items-center justify-center transition-colors ${
                selected === i ? "border-safety" : "border-concrete/15"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img}
                alt=""
                className="max-w-full max-h-full object-contain"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

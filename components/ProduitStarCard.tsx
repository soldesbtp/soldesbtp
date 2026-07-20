import Link from "next/link";

function formatDH(value: number) {
  return `${value.toLocaleString("fr-FR")} DH (MAD)`;
}

export default function ProduitStarCard({
  titre,
  imageUrl,
  prix,
  messageAccrocheur,
  imageBarreeUrl,
}: {
  titre: string;
  imageUrl: string;
  prix: number | null;
  messageAccrocheur?: string | null;
  imageBarreeUrl?: string | null;
}) {
  return (
    <Link
      href="/produit-star"
      className="stock-tag hover:shadow-lg transition-shadow overflow-hidden !p-0 flex flex-col relative"
    >
      <span className="stamp absolute top-3 left-3 z-10 bg-cement">
        PRODUIT VEDETTE
      </span>

      <div className="w-full h-48 bg-white border-b-2 border-concrete flex items-center justify-center p-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={titre}
          className="max-w-full max-h-full object-contain"
        />
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-body font-semibold mb-1 leading-snug">{titre}</h3>

        {messageAccrocheur && (
          <div className="flex items-center gap-2 my-2">
            {imageBarreeUrl && (
              <div className="relative w-10 h-10 flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageBarreeUrl}
                  alt=""
                  className="w-full h-full object-cover rounded-sm border border-concrete/15"
                />
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-1/2 left-0 w-full h-[2px] bg-alert -translate-y-1/2 rotate-45" />
                  <div className="absolute top-1/2 left-0 w-full h-[2px] bg-alert -translate-y-1/2 -rotate-45" />
                </div>
              </div>
            )}
            <p className="font-display text-xs uppercase text-alert leading-tight">
              {messageAccrocheur}
            </p>
          </div>
        )}

        {prix !== null && (
          <span className="price-current text-lg mt-auto">
            {formatDH(prix)}
          </span>
        )}
      </div>
    </Link>
  );
}

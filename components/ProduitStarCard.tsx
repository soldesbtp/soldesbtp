import Link from "next/link";

function formatDH(value: number) {
  return `${value.toLocaleString("fr-FR")} DH (MAD)`;
}

export default function ProduitStarCard({
  titre,
  imageUrl,
  prix,
}: {
  titre: string;
  imageUrl: string;
  prix: number | null;
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
        {prix !== null && (
          <span className="price-current text-lg mt-auto">
            {formatDH(prix)}
          </span>
        )}
      </div>
    </Link>
  );
}

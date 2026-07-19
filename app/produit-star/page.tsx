import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProduitStarGallery from "@/components/ProduitStarGallery";
import { getProduitStar } from "@/lib/produit-star";

function formatDH(value: number) {
  return `${value.toLocaleString("fr-FR")} DH (MAD)`;
}

function whatsappLink(phone: string, titre: string) {
  const digits = phone.replace(/[^0-9]/g, "");
  const international = digits.startsWith("0") ? "212" + digits.slice(1) : digits;
  const message = encodeURIComponent(
    `Bonjour, je suis intéressé(e) par le produit "${titre}" sur SoldesBTP.ma`
  );
  return `https://wa.me/${international}?text=${message}`;
}

export default async function ProduitStarPage() {
  const produit = await getProduitStar();

  if (!produit) {
    notFound();
  }

  const images = [
    produit.image_url_1,
    produit.image_url_2,
    produit.image_url_3,
  ].filter((url): url is string => Boolean(url));

  return (
    <main className="min-h-screen bg-cement">
      <Header />

      <section className="max-w-5xl mx-auto px-6 py-12 grid md:grid-cols-2 gap-10">
        <ProduitStarGallery images={images} titre={produit.titre ?? ""} />

        <div>
          <span className="stamp mb-4 inline-block">PRODUIT VEDETTE</span>
          <h1 className="font-display text-2xl mb-4">{produit.titre}</h1>

          {produit.description && (
            <p className="font-body text-sm text-steel mb-6 whitespace-pre-line">
              {produit.description}
            </p>
          )}

          {produit.prix !== null && (
            <p className="price-current text-2xl mb-6">
              {formatDH(produit.prix)}
            </p>
          )}

          {produit.whatsapp && (
            <a
              href={whatsappLink(produit.whatsapp, produit.titre ?? "")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-center font-body font-semibold px-8 py-3 bg-safety text-concrete rounded-sm hover:bg-safety-dark transition-colors"
            >
              Acheter ce produit
            </a>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}

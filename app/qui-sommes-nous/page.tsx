import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function QuiSommesNousPage() {
  return (
    <main className="min-h-screen bg-cement">
      <Header />
      <section className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="font-display text-3xl mb-6">QUI SOMMES-NOUS</h1>

        <div className="font-body text-steel space-y-5">
          <p>
            SoldesBTP.ma est la première marketplace marocaine dédiée aux
            déstockages, fins de série et surplus de stock du secteur du BTP.
          </p>

          <p>
            Notre mission est de mettre en relation les fournisseurs
            disposant de stocks à écouler avec les professionnels et
            particuliers à la recherche de bonnes affaires. Les particuliers
            ayant un surplus ou un reste de matériaux après un chantier
            peuvent eux aussi déposer leur annonce sur le site.
          </p>

          <p>Nous référençons des produits dans plusieurs catégories :</p>

          <ul className="list-disc list-inside space-y-1">
            <li>Carrelage</li>
            <li>Sanitaire</li>
            <li>Robinetterie</li>
            <li>Électricité</li>
            <li>Quincaillerie</li>
            <li>Étanchéité</li>
            <li>Outillage</li>
            <li>Matériaux de construction</li>
          </ul>

          <p>
            SoldesBTP.ma n&apos;est pas un vendeur de matériaux. Notre rôle
            est de faciliter la mise en relation entre acheteurs et
            fournisseurs partout au Maroc.
          </p>

          <p>
            Notre objectif : donner une seconde vie aux surplus de stock et
            permettre aux acheteurs d&apos;accéder à des prix avantageux.
          </p>
        </div>
      </section>
      <Footer />
    </main>
  );
}

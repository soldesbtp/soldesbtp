import Header from "@/components/Header";
import Hero from "@/components/Hero";
import TrustBadges from "@/components/TrustBadges";
import ListingCard, { Listing } from "@/components/ListingCard";
import Footer from "@/components/Footer";
import { getLatestListings } from "@/lib/listings";

// Données d'exemple — seront remplacées par une requête Supabase
// (table `listings`) une fois la base de données branchée.
const sampleListings: Listing[] = [
  {
    id: "1",
    title: "Carrelage grès cérame 60x60",
    location: "Sidi Maârouf, Casablanca",
    quantity: "85 m²",
    originalPrice: 6800,
    price: 3900,
    category: "Carrelage",
  },
  {
    id: "2",
    title: "Parquet stratifié chêne clair",
    location: "Aïn Sebaâ, Casablanca",
    quantity: "120 m²",
    originalPrice: 9600,
    price: 5800,
    category: "Parquets",
  },
  {
    id: "3",
    title: "Lot vasques + robinetterie",
    location: "Ain Harrouda",
    quantity: "25 ensembles",
    originalPrice: 18500,
    price: 11200,
    category: "Sanitaire",
  },
  {
    id: "4",
    title: "Baignoires îlot acrylique",
    location: "Bouskoura",
    quantity: "8 unités",
    originalPrice: 24000,
    price: 14500,
    category: "Baignoires",
  },
  {
    id: "5",
    title: "Câble électrique 3G2.5",
    location: "Mohammédia",
    quantity: "400 mètres",
    originalPrice: 1800,
    price: 1100,
    category: "Électricité",
  },
  {
    id: "6",
    title: "Panneaux de coffrage bois",
    location: "Aïn Sebaâ, Casablanca",
    quantity: "60 unités",
    originalPrice: 7200,
    price: 4300,
    category: "Coffrage",
  },
];

export default async function Home() {
  const dbListings = await getLatestListings();

  const listings: Listing[] =
    dbListings.length > 0
      ? dbListings.map((l) => ({
          id: l.id,
          title: l.titre,
          location: l.ville,
          quantity: l.quantite ?? "",
          originalPrice: l.prix_original,
          price: l.prix,
          category: l.collection,
          imageUrl: l.image_url,
          whatsapp: l.telephone,
          paysOrigine: l.pays_origine,
          fournisseurNom: l.importateur,
          fournisseurPhoto: l.fournisseur_photo,
        }))
      : sampleListings;

  return (
    <main>
      <Header />
      <Hero />
      <TrustBadges />

      <section id="annonces" className="max-w-6xl mx-auto px-6 py-16">
        <div className="flex items-baseline justify-between mb-8">
          <h2 className="font-display text-2xl">DERNIÈRES BONNES AFFAIRES</h2>
          <a
            href="#"
            className="font-body text-sm text-steel hover:text-alert transition-colors"
          >
            Voir toutes les annonces →
          </a>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </section>

      <section
        id="comment-ca-marche"
        className="bg-white border-y border-concrete/10"
      >
        <div className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-10">
          <div>
            <span className="font-mono text-safety-dark text-sm">01</span>
            <h3 className="font-display text-lg mt-2 mb-2">DÉPOSEZ</h3>
            <p className="font-body text-sm text-steel">
              Importateur ou revendeur, mettez en ligne votre stock dormant :
              quantité, prix, photos. En ligne en 2 minutes.
            </p>
          </div>
          <div>
            <span className="font-mono text-safety-dark text-sm">02</span>
            <h3 className="font-display text-lg mt-2 mb-2">ÉCHANGEZ</h3>
            <p className="font-body text-sm text-steel">
              Professionnels et particuliers vous contactent directement.
              Vous négociez et fixez les modalités.
            </p>
          </div>
          <div>
            <span className="font-mono text-safety-dark text-sm">03</span>
            <h3 className="font-display text-lg mt-2 mb-2">TRANSFORMEZ</h3>
            <p className="font-body text-sm text-steel">
              Votre stock dormant devient du cash, et l&apos;acheteur repart
              avec une bonne affaire.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

import VilleDropdown from "@/components/VilleDropdown";
import Image from "next/image";

export default function Hero() {
  return (
    <section className="bg-concrete text-cement">
      <div className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
        <div className="flex flex-col items-center text-center">
          <span className="stamp mb-6 inline-block">Stock dormant</span>
          <h1 className="font-display text-4xl md:text-5xl leading-tight mb-6">
            STOCK À ÉCOULER<span className="text-safety">?</span>
            <br />
            <span className="text-safety">TROUVEZ</span> VOTRE
            <br />
            ACHETEUR
          </h1>
          <p className="font-body text-cement/70 text-lg mb-8 max-w-md">
            Importateurs, revendeurs : mettez en ligne vos lots dormants.
            Professionnels et particuliers du BTP trouvent ici les bonnes
            affaires qu&apos;ils cherchent, directement auprès de vous.
          </p>
          <VilleDropdown size="lg" />
        </div>

        <div className="flex justify-center">
          <Image
            src="/logo.png"
            alt="SoldesBTP.ma"
            width={340}
            height={340}
            className="rounded-full"
          />
        </div>
      </div>
    </section>
  );
}

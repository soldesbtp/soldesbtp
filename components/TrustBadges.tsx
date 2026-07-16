import { Tag, ShieldCheck, Handshake, MapPin, Package } from "lucide-react";

const badges = [
  { icon: Tag, label: "Jusqu'à -70%" },
  { icon: ShieldCheck, label: "Fournisseurs vérifiés" },
  { icon: Handshake, label: "Mise en relation directe" },
  { icon: MapPin, label: "Partout au Maroc" },
  { icon: Package, label: "Fins de série & surplus" },
];

export default function TrustBadges() {
  return (
    <section className="bg-concrete border-t border-cement/10">
      <div className="max-w-6xl mx-auto px-6 py-6 flex flex-wrap justify-between gap-6">
        {badges.map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-2 text-cement/80">
            <Icon size={20} className="text-safety" strokeWidth={1.75} />
            <span className="font-body text-sm">{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

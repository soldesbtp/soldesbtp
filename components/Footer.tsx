export default function Footer() {
  return (
    <footer className="bg-concrete text-cement/60 mt-20">
      <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row justify-between gap-6">
        <div>
          <span className="font-display text-lg text-cement">
            SOLDES<span className="text-safety">BTP</span>
          </span>
          <p className="font-body text-sm mt-2 max-w-xs">
            La marketplace marocaine des surplus de matériaux BTP.
          </p>
        </div>
        <div className="font-body text-sm">
          <p>© {new Date().getFullYear()} SoldesBTP.ma — Tous droits réservés</p>
        </div>
      </div>
    </footer>
  );
}

const categories = [
  "Carrelage",
  "Parquets",
  "Sanitaire",
  "Accessoires salle de bain",
  "Baignoires",
  "Électricité",
  "Plomberie",
  "Coffrage",
];

export default function CategoryStrip() {
  return (
    <section id="categories" className="bg-cement border-y border-concrete/10">
      <div className="max-w-6xl mx-auto px-6 py-6 flex flex-wrap gap-3">
        {categories.map((cat) => (
          <button
            key={cat}
            className="font-body text-sm px-4 py-2 bg-white border border-concrete/15 rounded-sm hover:border-safety hover:text-alert transition-colors"
          >
            {cat}
          </button>
        ))}
      </div>
    </section>
  );
}

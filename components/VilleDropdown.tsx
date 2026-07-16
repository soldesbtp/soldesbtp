"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const villes = ["Casablanca", "Rabat", "Marrakech", "Tanger", "Fès", "Agadir"];

export default function VilleDropdown({
  basePath = "/recherche",
  label = "Choisir ma ville",
  variant = "filled",
  size = "md",
}: {
  basePath?: string;
  label?: string;
  variant?: "filled" | "outline";
  size?: "md" | "lg";
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const sizeClass =
    size === "lg" ? "px-10 py-5 text-lg" : "px-6 py-3 text-base";

  const buttonClass =
    variant === "filled"
      ? `font-body font-semibold ${sizeClass} bg-safety text-concrete rounded-sm hover:bg-safety-dark transition-colors shadow-lg`
      : `font-body font-semibold ${sizeClass} border border-cement/30 text-cement rounded-sm hover:border-safety hover:text-safety transition-colors`;

  return (
    <div className="relative inline-block">
      <button onClick={() => setOpen((o) => !o)} className={buttonClass}>
        {label}
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 bg-white border border-concrete/15 rounded-sm shadow-lg z-10 min-w-[200px] overflow-hidden">
          {villes.map((v) => (
            <button
              key={v}
              onClick={() => {
                setOpen(false);
                router.push(`${basePath}?ville=${encodeURIComponent(v)}`);
              }}
              className="w-full text-left font-body px-4 py-3 text-concrete hover:bg-cement hover:text-alert transition-colors"
            >
              {v}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

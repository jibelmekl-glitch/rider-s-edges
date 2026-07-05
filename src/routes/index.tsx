import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header, Footer, QuickLinks, ProductCard, useSession, ChevronLeft, ChevronRight, type HeroTabId } from "@/components/site/SiteChrome";
import { getCategories, getFeaturedProducts } from "@/lib/catalog.functions";
import { useLocalCart } from "@/lib/local-cart";
import { useI18n } from "@/lib/i18n";
import { getCategoryIcon } from "@/lib/category-icons";
import { WorkshopScene } from "@/components/site/graphics";
import { toast } from "sonner";
import heroScooter from "@/assets/hero-scooter.jpg";

export const Route = createFileRoute("/")({
  component: Home,
});

// Fallback shortcuts shown until real categories load from the database.
// Icons are resolved by name/keyword (see lib/category-icons), never by array
// position, so they always stay distinct and correct.
const FALLBACK_LABELS = [
  "Accessoires de moto", "Atelier et produits chimiques", "Batteries", "Cadre",
  "Chassis", "Échappement", "Étanche", "Filtration", "Kits entretien",
  "Lubrifiants et additifs", "Moteur", "Pneus", "Roulements", "Suspensions",
  "Système d'alimentation", "Système de freinage",
];
const SHORTCUTS = FALLBACK_LABELS.map((label) => ({
  label, slug: "freinage", Icon: getCategoryIcon(label),
}));

// Hero slideshow slides — the real workshop photo plus two same-theme
// illustrated scenes (brake and battery focus) for visual variety.
const HERO_SLIDES = [
  { kind: "photo" as const, image: heroScooter, kicker: "hero_kicker", title1: "hero_title_1", title2: "hero_title_2", accent: "#D61C2C" },
  { kind: "scene" as const, kicker: "hero_kicker", title1: "Freinage Racing", title2: "Performance", accent: "#e0475c" },
  { kind: "scene" as const, kicker: "hero_kicker", title1: "Batteries Lithium", title2: "Puissance", accent: "#4d8fe0" },
];

function Home() {
  const user = useSession();
  const cart = useLocalCart();
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<HeroTabId>("best-sellers");
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setSlide((s) => (s + 1) % HERO_SLIDES.length), 5000);
    return () => clearInterval(id);
  }, []);

  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: () => getCategories() });
  const { data: featured = [] } = useQuery({ queryKey: ["featured"], queryFn: () => getFeaturedProducts() });

  // Split featured into three tab buckets for a dynamic mock feel
  const tabProducts = useMemo(() => {
    const list: any[] = featured as any[];
    if (!list.length) return [];
    const n = list.length;
    if (activeTab === "nouveautes") return list.slice(0, Math.ceil(n / 2));
    if (activeTab === "destockage") return list.slice(-Math.ceil(n / 2)).reverse();
    return list; // best-sellers
  }, [featured, activeTab]);

  const tabTitle = activeTab === "nouveautes" ? t.nouveautes : activeTab === "destockage" ? t.destockage : t.best_sellers;

  function handleAdd(p: any) {
    if (!user) {
      toast.error("Connectez-vous pour voir les prix et commander");
      return;
    }
    cart.add({
      id: p.id,
      name: p.name,
      brand: p.brands?.name,
      reference: p.reference,
      price: Number(p.price_pro ?? 0),
      image: p.image_url,
    });
    toast.success("Ajouté au panier");
  }

  const displayCats = categories.length ? categories.slice(0, 16).map((c: any) => ({
    label: c.name, slug: c.slug, Icon: getCategoryIcon(c.name ?? c.slug ?? ""),
  })) : SHORTCUTS;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      {/* Hero slideshow */}
      <section className="relative overflow-hidden">
        <div className="relative h-[500px] w-full">
          {HERO_SLIDES.map((s, i) => (
            <div
              key={i}
              className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
              style={{ opacity: slide === i ? 1 : 0 }}
            >
              {s.kind === "photo" ? (
                <img src={s.image} alt="EVOX phares LED scooter" width={1920} height={640} className="absolute inset-0 h-full w-full object-cover" />
              ) : (
                <WorkshopScene accent={s.accent} />
              )}
              <div className="absolute inset-0" style={{ background: "linear-gradient(to right, oklch(0.1 0.03 262 / 0.75), transparent 40%, transparent 60%, oklch(0.1 0.03 262 / 0.75))" }} />
              <div className="relative z-10 mx-auto flex h-full max-w-6xl flex-col items-center justify-center px-6 text-center text-white">
                <div className="mb-2 text-xs uppercase tracking-[0.4em] text-white/70">{t.hero_kicker}</div>
                <h1 className="text-5xl md:text-7xl font-bold uppercase tracking-tight" style={{ WebkitTextStroke: "1px oklch(1 0 0 / 0.9)", color: "transparent" }}>
                  {i === 0 ? t.hero_title_1 : s.title1}
                </h1>
                <h2 className="mt-2 text-6xl md:text-8xl font-bold uppercase italic tracking-tighter text-white">
                  {i === 0 ? t.hero_title_2 : s.title2}
                </h2>
                <Link to="/category/$slug" params={{ slug: "freinage" }} className="mt-8 rounded bg-accent px-10 py-4 text-lg font-bold uppercase text-accent-foreground shadow-lift hover:brightness-110">
                  {t.discover}
                </Link>
              </div>
            </div>
          ))}

          <button
            onClick={() => setSlide((s) => (s - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
            className="absolute left-4 top-1/2 z-10 -translate-y-1/2 flex h-14 w-14 items-center justify-center bg-white/10 text-white backdrop-blur hover:bg-accent"
          ><ChevronLeft className="h-8 w-8" /></button>
          <button
            onClick={() => setSlide((s) => (s + 1) % HERO_SLIDES.length)}
            className="absolute right-4 top-1/2 z-10 -translate-y-1/2 flex h-14 w-14 items-center justify-center bg-white/10 text-white backdrop-blur hover:bg-accent"
          ><ChevronRight className="h-8 w-8" /></button>

          <div className="absolute top-4 left-1/2 z-20 flex -translate-x-1/2 gap-2">
            {HERO_SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlide(i)}
                aria-label={`Slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${slide === i ? "w-6 bg-accent" : "w-1.5 bg-white/50 hover:bg-white/80"}`}
              />
            ))}
          </div>

          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-20 w-full max-w-4xl px-6">
            <QuickLinks activeTab={activeTab} onChange={setActiveTab} />
          </div>
        </div>
      </section>

      {/* Category grid: distinct powersports icons, larger, 16 items */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-4 gap-4 md:grid-cols-8">
          {displayCats.map((c: any) => (
            <Link
              key={c.label}
              to="/category/$slug"
              params={{ slug: c.slug }}
              className="group flex flex-col items-center gap-3 rounded-md border border-border bg-card p-5 text-center transition hover:border-accent hover:shadow-lift"
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary text-brand transition group-hover:bg-brand group-hover:text-brand-foreground">
                <c.Icon className="h-14 w-14" strokeWidth={1.5} />
              </div>
              <div className="text-sm font-bold uppercase tracking-wide text-brand leading-tight">{c.label}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Dynamic tab products */}
      <section className="mx-auto max-w-7xl px-6 pb-16">
        <div className="mb-6 flex items-center gap-4">
          <h2 className="text-2xl font-bold uppercase tracking-wide text-accent">{tabTitle}</h2>
          <Link to="/category/$slug" params={{ slug: "freinage" }} className="flex items-center gap-2 rounded border border-border bg-card px-4 py-2 text-xs font-bold uppercase text-brand hover:border-accent hover:text-accent">
            {t.view_all} <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {tabProducts.map((p: any) => (
            <ProductCard key={p.id} p={p} showPrice={!!user} onAdd={() => handleAdd(p)} />
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}

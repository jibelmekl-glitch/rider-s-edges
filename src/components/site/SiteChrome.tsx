import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Search, ShoppingCart, Heart, User, Bike, Megaphone, ShoppingBasket, Hourglass,
  Lock, LogOut, ChevronLeft, ChevronRight, ChevronDown,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getCategories, getBrands } from "@/lib/catalog.functions";
import { getProfile } from "@/lib/account.functions";
import { useLocalCart } from "@/lib/local-cart";
import { useI18n } from "@/lib/i18n";
import logo from "@/assets/logo-motobike.png";

export function useSession() {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) setUser({ id: data.session.user.id, email: data.session.user.email });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setUser(s?.user ? { id: s.user.id, email: s.user.email } : null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);
  return user;
}

const LANGS: { code: "FR" | "US" | "DE"; label: string; flag: string }[] = [
  { code: "FR", label: "Français", flag: "🇫🇷" },
  { code: "US", label: "English", flag: "🇺🇸" },
  { code: "DE", label: "Deutsch", flag: "🇩🇪" },
];

function LanguageSelector() {
  const [open, setOpen] = useState(false);
  const { lang, setLang } = useI18n();
  const current = LANGS.find((l) => l.code === lang) ?? LANGS[0];
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className="flex items-center gap-1.5 rounded px-2 py-1 text-brand-foreground hover:bg-white/10"
      >
        <span className="text-base leading-none">{current.flag}</span>
        <span className="text-[11px] font-bold">{current.code}</span>
        <ChevronDown className="h-3 w-3" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-40 rounded-md border border-border bg-white text-gray-800 shadow-xl z-[100]">
          {LANGS.map((l) => (
            <button
              key={l.code}
              onMouseDown={(e) => { e.preventDefault(); setLang(l.code); setOpen(false); }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-semibold hover:bg-gray-100 hover:text-red-600"
            >
              <span className="text-base">{l.flag}</span>
              <span className="w-6">{l.code}</span>
              <span className="text-[11px] text-gray-500">{l.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

type NavNode = { label: string; items?: string[] };
const NAV: { label: string; groups: NavNode[] }[] = [
  {
    label: "Vélo",
    groups: [
      { label: "Pneumatique", items: ["Pneus route", "Pneus VTT", "Chambres à air", "Fonds de jante"] },
      { label: "Transmission", items: ["Chaînes", "Cassettes", "Plateaux", "Dérailleurs"] },
      { label: "Freinage", items: ["Plaquettes", "Disques", "Étriers", "Câbles & gaines"] },
      { label: "Éclairage", items: ["Éclairage avant", "Éclairage arrière", "Batteries"] },
      { label: "Accessoires", items: ["Casques", "Gants", "Antivols", "Sacoches"] },
    ],
  },
  {
    label: "Moto",
    groups: [
      { label: "Pneumatique", items: ["Pneus route", "Pneus off-road", "Chambres à air"] },
      { label: "Transmission", items: ["Chaînes", "Kits chaîne", "Courroies", "Variateurs"] },
      { label: "Freinage", items: ["Plaquettes", "Disques", "Étriers", "Liquide de frein"] },
      { label: "Filtration", items: ["Filtres à air", "Filtres à huile", "Filtres à essence"] },
      { label: "Échappement", items: ["Silencieux", "Lignes complètes", "Collecteurs"] },
      { label: "Accessoires", items: ["Casques", "Gants", "Bagagerie"] },
    ],
  },
  {
    label: "Trottinette",
    groups: [
      { label: "Pneumatique", items: ["Pneus pleins", "Pneus gonflables", "Chambres à air"] },
      { label: "Batteries", items: ["Lithium 36V", "Lithium 48V", "Chargeurs"] },
      { label: "Freinage", items: ["Plaquettes", "Disques", "Freins tambour"] },
      { label: "Éclairage", items: ["Phares avant", "Feux arrière", "Clignotants"] },
      { label: "Accessoires", items: ["Guidons", "Poignées", "Antivols"] },
    ],
  },
  {
    label: "Marques",
    groups: [
      { label: "Premium", items: ["Yamaha", "Piaggio", "Vespa", "Honda"] },
      { label: "Performance", items: ["EVOX", "Malossi", "Polini", "Stage6"] },
      { label: "Freinage", items: ["Brembo", "Ferodo", "Galfer"] },
      { label: "Consommables", items: ["Motul", "Castrol", "NGK"] },
    ],
  },
];

function NavMegaMenu({ label, groups }: { label: string; groups: NavNode[] }) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  return (
    <div className="group relative">
      <button className="flex items-center gap-1 px-4 py-3 text-xs md:text-sm font-bold uppercase tracking-wide text-brand-foreground transition hover:bg-white/5">
        {label} <ChevronDown className="h-3 w-3" />
      </button>
      <div
        className="absolute top-full left-0 w-64 bg-white text-gray-800 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-[100] border-t-2 border-red-600"
        onMouseLeave={() => setHoverIdx(null)}
      >
        <div className="flex flex-col py-2">
          {groups.map((g, idx) => (
            <div
              key={g.label}
              className="relative"
              onMouseEnter={() => setHoverIdx(idx)}
            >
              <div className="flex items-center justify-between px-4 py-2 hover:bg-gray-100 hover:text-red-600 cursor-pointer text-sm font-semibold">
                <span>{g.label}</span>
                {g.items && <ChevronRight className="h-3.5 w-3.5" />}
              </div>
              {g.items && hoverIdx === idx && (
                <div className="absolute top-0 left-full w-60 bg-white text-gray-800 shadow-xl border-t-2 border-red-600 z-[110]">
                  <div className="flex flex-col py-2">
                    {g.items.map((it) => (
                      <a
                        key={it}
                        href="#"
                        className="px-4 py-2 hover:bg-gray-100 hover:text-red-600 cursor-pointer text-sm font-medium"
                      >
                        {it}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Header() {
  const user = useSession();
  const router = useRouter();
  const navigate = useNavigate();
  const { t } = useI18n();
  const [searchQ, setSearchQ] = useState("");
  const { count: cartCount, total: cartTotal } = useLocalCart();

  useQuery({ queryKey: ["categories"], queryFn: () => getCategories() });
  useQuery({ queryKey: ["brands"], queryFn: () => getBrands() });
  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id], queryFn: () => getProfile(), enabled: !!user,
  });

  async function handleLogout() {
    await supabase.auth.signOut();
    router.invalidate();
    navigate({ to: "/" });
  }

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQ.trim()) navigate({ to: "/search", search: { q: searchQ.trim() } });
  }

  return (
    <div className="relative z-40 bg-brand text-brand-foreground">
      {/* top strip */}
      <div className="flex items-center justify-between px-4 py-2 text-[11px] uppercase tracking-wider">
        <div className="w-1/3" />
        <div className="hidden md:block flex-1 text-center text-brand-foreground/80">
          {t.tagline}
        </div>
        <div className="flex w-1/3 items-center justify-end gap-3">
          <LanguageSelector />
        </div>
      </div>

      {/* white band */}
      <div className="relative bg-background text-foreground">
        <div className="grid grid-cols-12 items-center gap-6 px-4 py-3">
          <div className="col-span-4" />
          <div className="col-span-4 flex justify-center">
            <Link to="/" className="block">
              <img src={logo} alt="MOTOBIKE — Your Best Partner" width={220} height={90} className="h-16 w-auto object-contain" />
            </Link>
          </div>
          <div className="col-span-4 flex items-center justify-end gap-4">
            {user ? (
              <div className="flex items-center gap-2 text-sm">
                <User className="h-8 w-8 rounded-full bg-muted p-1.5 text-brand" />
                <div className="leading-tight max-w-[140px]">
                  <div className="text-xs text-muted-foreground truncate">{profile?.account_number ?? "—"}</div>
                  <div className="font-semibold truncate">{profile?.company_name ?? user.email}</div>
                </div>
                <Link to="/garage" title={t.my_garage} className="text-muted-foreground hover:text-accent"><Bike className="h-4 w-4" /></Link>
                <button onClick={handleLogout} title={t.logout} className="text-muted-foreground hover:text-accent">
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Link to="/auth" className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-semibold hover:border-accent hover:text-accent">
                <Lock className="h-4 w-4" /> {t.login}
              </Link>
            )}
            <Link to="/cart" className="flex items-center gap-2 text-sm">
              <div className="relative">
                <ShoppingCart className="h-7 w-7 text-brand" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground">
                    {cartCount}
                  </span>
                )}
              </div>
              <div className="leading-tight">
                <div className="text-xs text-muted-foreground">{t.cart}</div>
                <div className="font-semibold">{cartTotal.toFixed(2).replace(".", ",")} €</div>
              </div>
            </Link>
            <Heart className="h-6 w-6 text-brand" />
          </div>
        </div>
      </div>

      {/* Nav bar */}
      <div className="relative border-b border-brand/10">
        <div className="flex items-center px-2">
          {NAV.map((n) => (
            <NavMegaMenu key={n.label} label={n.label} groups={n.groups} />
          ))}
        </div>

        {/* Search bar centered */}
        <div className="pointer-events-none absolute left-1/2 top-full -translate-x-1/2 -translate-y-1/2 z-50">
          <form
            onSubmit={onSearch}
            style={{ clipPath: 'polygon(3% 0, 97% 0, 100% 100%, 0% 100%)' }}
            className="pointer-events-auto flex items-center gap-3 bg-background pl-6 pr-2 py-2 shadow-lift w-[560px] max-w-[80vw]"
          >
            <Bike className="h-8 w-8 text-brand shrink-0" />
            <div className="w-[2px] h-8 bg-gray-200 transform -skew-x-[24deg]" />
            <input
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              placeholder={t.search_placeholder}
              className="h-10 w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
            <div className="w-[2px] h-8 bg-gray-200 transform -skew-x-[24deg]" />
            <button type="submit" className="flex h-10 w-12 items-center justify-center text-brand hover:text-accent">
              <Search className="h-5 w-5" />
            </button>
          </form>
          <div className="pointer-events-auto mx-auto flex w-[420px] max-w-[70vw] justify-center -mt-[1px]">
            <button
              style={{ clipPath: 'polygon(0 0, 100% 0, 93% 100%, 7% 100%)' }}
              className="w-full bg-brand py-2 px-8 text-center text-sm font-bold uppercase tracking-wider text-brand-foreground"
            >
              {t.search_by_vehicle}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export type HeroTabId = "nouveautes" | "best-sellers" | "destockage";

export function QuickLinks({
  activeTab,
  onChange,
}: {
  activeTab?: HeroTabId;
  onChange?: (t: HeroTabId) => void;
}) {
  const { t } = useI18n();
  const tabs: { id: HeroTabId; i: React.ReactNode; l: string }[] = [
    { id: "nouveautes", i: <Megaphone className="h-5 w-5" />, l: t.nouveautes },
    { id: "best-sellers", i: <ShoppingBasket className="h-5 w-5" />, l: t.best_sellers },
    { id: "destockage", i: <Hourglass className="h-5 w-5" />, l: t.destockage },
  ];
  return (
    <div
      style={{ clipPath: 'polygon(0 0, 100% 0, 96% 100%, 4% 100%)' }}
      className="flex bg-brand text-brand-foreground shadow-lift"
    >
      {tabs.map((x, i) => {
        const active = activeTab === x.id;
        return (
          <button
            key={x.id}
            onClick={() => onChange?.(x.id)}
            className={`flex flex-1 items-center justify-center gap-3 py-4 text-xs md:text-sm font-bold uppercase tracking-widest transition ${active ? "bg-accent text-accent-foreground" : "hover:bg-[#1a2b4c]"} ${i < tabs.length - 1 ? "border-r border-gray-600/50" : ""}`}
          >
            {x.i} {x.l}
          </button>
        );
      })}
    </div>
  );
}

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="mt-16 bg-brand text-brand-foreground">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 py-12 md:grid-cols-4">
        <div>
          <img src={logo} alt="MOTOBIKE" width={180} height={72} loading="lazy" className="h-12 w-auto object-contain brightness-0 invert" />
          <p className="mt-3 text-sm text-brand-foreground/70">{t.tagline}</p>
        </div>
        {[
          { t: t.shop, l: [[t.nouveautes, "/"], [t.brands, "/"], [t.my_garage, "/garage"]] as const },
          { t: t.account, l: [[t.login, "/auth"], [t.my_cart, "/cart"], [t.my_garage, "/garage"]] as const },
          { t: t.help, l: [[t.contact, "/"], [t.delivery, "/"], ["CGV", "/"]] as const },
        ].map((c) => (
          <div key={c.t}>
            <div className="mb-3 text-sm font-bold uppercase tracking-widest">{c.t}</div>
            <ul className="space-y-2 text-sm text-brand-foreground/70">
              {c.l.map(([label, href]) => (
                <li key={label}><Link to={href} className="hover:text-accent">{label}</Link></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-brand-foreground/60">
        © {new Date().getFullYear()} MOTOBIKE — Your Best Partner
      </div>
    </footer>
  );
}

export { Bike, ChevronLeft, ChevronRight, Lock, ShoppingCart };

export function ProductCard({
  p, showPrice, onAdd,
}: {
  p: any;
  showPrice: boolean;
  onAdd?: (id: string) => void;
}) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-md border border-border bg-card shadow-card transition hover:shadow-lift">
      {p.tag && (
        <div className="absolute left-0 top-3 z-10">
          <span className={`px-3 py-1 text-[10px] font-bold uppercase ${p.tag === "NOUVEAUTÉS" ? "bg-destructive text-white" : "bg-promo text-promo-foreground"}`}>
            {p.tag}
          </span>
        </div>
      )}
      <Link to="/product/$ref" params={{ ref: p.reference }} className="aspect-square bg-white p-6">
        <img src={p.image_url || "/images/product-caliper.jpg"} alt={p.name} loading="lazy" width={640} height={640} className="h-full w-full object-contain" />
      </Link>
      <div className="border-t border-border p-4">
        <div className="mb-2 text-xs font-bold uppercase tracking-widest text-brand">{p.brands?.name ?? ""}</div>
        <Link to="/product/$ref" params={{ ref: p.reference }} className="mb-3 line-clamp-3 block min-h-[3.6em] text-[13px] font-semibold uppercase text-foreground hover:text-accent">
          {p.name}
        </Link>
        <div className="text-[11px] text-muted-foreground">
          <div><span className="font-bold">RÉF:</span> {p.reference}</div>
          {p.ean && <div><span className="font-bold">EAN:</span> {p.ean}</div>}
        </div>
      </div>
      <div className="mt-auto flex items-center justify-between border-t border-border bg-secondary/40 px-4 py-3">
        {showPrice ? (
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-foreground">{Number(p.price_pro).toFixed(2).replace(".", ",")} €</span>
            {p.price_old && <span className="text-sm text-muted-foreground line-through">{Number(p.price_old).toFixed(2).replace(".", ",")} €</span>}
          </div>
        ) : (
          <Link to="/auth" className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground hover:text-accent">
            <Lock className="h-3.5 w-3.5" /> Connectez-vous
          </Link>
        )}
        <button
          onClick={() => onAdd?.(p.id)}
          disabled={!showPrice}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-brand transition hover:bg-accent hover:text-accent-foreground disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ShoppingCart className="h-5 w-5" />
        </button>
      </div>
    </article>
  );
}

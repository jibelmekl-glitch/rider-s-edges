import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "FR" | "US" | "DE";

const dict = {
  FR: {
    tagline: "Pièces détachées et accessoires pour le monde du deux-roues",
    login: "Se connecter",
    search_placeholder: "Recherche libre ou par code produit",
    search_by_vehicle: "Recherche par véhicules",
    cart: "panier",
    nouveautes: "Nouveautés",
    best_sellers: "Best-sellers",
    destockage: "Déstockage",
    discover: "Découvrir",
    view_all: "Voir tous les produits",
    connect_prompt: "Connectez-vous",
    hero_kicker: "Where performance begins",
    hero_title_1: "Phares Iron LED",
    hero_title_2: "Scooter",
    shop: "Boutique",
    account: "Compte",
    help: "Aide",
    my_garage: "Mon garage",
    my_cart: "Mon panier",
    brands: "Marques",
    contact: "Contact",
    delivery: "Livraison",
    logout: "Déconnexion",
  },
  US: {
    tagline: "Spare parts and accessories for the two-wheeler world",
    login: "Log in",
    search_placeholder: "Free search or by product code",
    search_by_vehicle: "Search by vehicle",
    cart: "cart",
    nouveautes: "New arrivals",
    best_sellers: "Best-sellers",
    destockage: "Clearance",
    discover: "Discover",
    view_all: "View all products",
    connect_prompt: "Log in",
    hero_kicker: "Where performance begins",
    hero_title_1: "Iron LED Headlights",
    hero_title_2: "Scooter",
    shop: "Shop",
    account: "Account",
    help: "Help",
    my_garage: "My garage",
    my_cart: "My cart",
    brands: "Brands",
    contact: "Contact",
    delivery: "Shipping",
    logout: "Log out",
  },
  DE: {
    tagline: "Ersatzteile und Zubehör für die Zweirad-Welt",
    login: "Anmelden",
    search_placeholder: "Freie Suche oder nach Produktcode",
    search_by_vehicle: "Suche nach Fahrzeug",
    cart: "Warenkorb",
    nouveautes: "Neuheiten",
    best_sellers: "Bestseller",
    destockage: "Lagerräumung",
    discover: "Entdecken",
    view_all: "Alle Produkte ansehen",
    connect_prompt: "Anmelden",
    hero_kicker: "Where performance begins",
    hero_title_1: "Iron LED Scheinwerfer",
    hero_title_2: "Scooter",
    shop: "Shop",
    account: "Konto",
    help: "Hilfe",
    my_garage: "Meine Garage",
    my_cart: "Mein Warenkorb",
    brands: "Marken",
    contact: "Kontakt",
    delivery: "Versand",
    logout: "Abmelden",
  },
} as const;

export type Dict = { [K in keyof typeof dict.FR]: string };

const I18nCtx = createContext<{ lang: Lang; t: Dict; setLang: (l: Lang) => void } | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("FR");

  useEffect(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem("lang") : null;
    if (stored === "FR" || stored === "US" || stored === "DE") setLangState(stored);
  }, []);

  function setLang(l: Lang) {
    setLangState(l);
    if (typeof window !== "undefined") window.localStorage.setItem("lang", l);
  }

  return (
    <I18nCtx.Provider value={{ lang, t: dict[lang], setLang }}>
      {children}
    </I18nCtx.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nCtx);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

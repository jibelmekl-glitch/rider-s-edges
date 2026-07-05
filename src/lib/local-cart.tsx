import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type LocalCartItem = {
  id: string;
  name: string;
  brand?: string;
  reference?: string;
  price: number;
  image?: string;
  quantity: number;
};

type Ctx = {
  items: LocalCartItem[];
  count: number;
  total: number;
  add: (item: Omit<LocalCartItem, "quantity">, qty?: number) => void;
  remove: (id: string) => void;
  clear: () => void;
};

const CartCtx = createContext<Ctx | null>(null);
const KEY = "motobike:cart:v1";

export function LocalCartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<LocalCartItem[]>([]);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem(KEY) : null;
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);
  useEffect(() => {
    try {
      if (typeof window !== "undefined") window.localStorage.setItem(KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  const add: Ctx["add"] = (item, qty = 1) => {
    setItems((prev) => {
      const ex = prev.find((p) => p.id === item.id);
      if (ex) return prev.map((p) => (p.id === item.id ? { ...p, quantity: p.quantity + qty } : p));
      return [...prev, { ...item, quantity: qty }];
    });
  };
  const remove = (id: string) => setItems((prev) => prev.filter((p) => p.id !== id));
  const clear = () => setItems([]);

  const count = items.reduce((s, i) => s + i.quantity, 0);
  const total = items.reduce((s, i) => s + i.quantity * i.price, 0);

  return <CartCtx.Provider value={{ items, count, total, add, remove, clear }}>{children}</CartCtx.Provider>;
}

export function useLocalCart() {
  const ctx = useContext(CartCtx);
  if (!ctx) throw new Error("useLocalCart must be inside LocalCartProvider");
  return ctx;
}

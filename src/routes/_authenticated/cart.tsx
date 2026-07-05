import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Header, Footer } from "@/components/site/SiteChrome";
import { getCart, removeCartItem, updateCartItem } from "@/lib/account.functions";
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/cart")({
  head: () => ({ meta: [{ title: "Mon panier — MOTOBIKE" }] }),
  component: CartPage,
});

function CartPage() {
  const qc = useQueryClient();
  const { data: items = [] } = useQuery({ queryKey: ["cart"], queryFn: () => getCart() });

  const update = useMutation({
    mutationFn: (v: { id: string; quantity: number }) => updateCartItem({ data: v }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cart"] }),
  });
  const remove = useMutation({
    mutationFn: (id: string) => removeCartItem({ data: { id } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["cart"] }); toast.success("Retiré du panier"); },
  });

  const total = items.reduce((s, i: any) => s + i.quantity * Number(i.products?.price_pro ?? 0), 0);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <section className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="mb-8 text-3xl font-bold uppercase tracking-tight text-brand">Mon panier</h1>
        {items.length === 0 ? (
          <div className="rounded-md border border-dashed border-border p-12 text-center">
            <ShoppingCart className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
            <p className="mb-6 text-muted-foreground">Votre panier est vide.</p>
            <Link to="/" className="inline-block rounded-md bg-accent px-6 py-3 text-sm font-bold uppercase text-accent-foreground">Continuer mes achats</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
            <div className="space-y-3">
              {items.map((i: any) => (
                <div key={i.id} className="flex items-center gap-4 rounded-md border border-border bg-card p-4">
                  <img src={i.products?.image_url || "/images/product-caliper.jpg"} alt={i.products?.name} className="h-20 w-20 rounded bg-white object-contain p-2" />
                  <div className="flex-1">
                    <div className="text-xs font-bold uppercase text-brand">{i.products?.brands?.name}</div>
                    <Link to="/product/$ref" params={{ ref: i.products.reference }} className="text-sm font-semibold uppercase hover:text-accent">{i.products?.name}</Link>
                    <div className="mt-1 text-xs text-muted-foreground">RÉF: {i.products?.reference}</div>
                  </div>
                  <div className="flex h-10 items-center rounded-md border border-border">
                    <button onClick={() => update.mutate({ id: i.id, quantity: i.quantity - 1 })} className="flex h-full w-9 items-center justify-center hover:text-accent"><Minus className="h-3 w-3" /></button>
                    <span className="w-8 text-center font-bold">{i.quantity}</span>
                    <button onClick={() => update.mutate({ id: i.id, quantity: i.quantity + 1 })} className="flex h-full w-9 items-center justify-center hover:text-accent"><Plus className="h-3 w-3" /></button>
                  </div>
                  <div className="w-28 text-right font-bold">{(Number(i.products?.price_pro) * i.quantity).toFixed(2).replace(".", ",")} €</div>
                  <button onClick={() => remove.mutate(i.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
            <aside className="h-fit rounded-md border border-border bg-card p-6">
              <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-brand">Récapitulatif</h2>
              <div className="flex justify-between border-b border-border py-3 text-sm">
                <span>Sous-total HT</span>
                <span>{(total / 1.2).toFixed(2).replace(".", ",")} €</span>
              </div>
              <div className="flex justify-between border-b border-border py-3 text-sm">
                <span>TVA 20%</span>
                <span>{(total - total / 1.2).toFixed(2).replace(".", ",")} €</span>
              </div>
              <div className="flex justify-between py-4 text-lg font-bold">
                <span>Total TTC</span>
                <span>{total.toFixed(2).replace(".", ",")} €</span>
              </div>
              <button className="h-12 w-full rounded-md bg-accent text-sm font-bold uppercase tracking-wide text-accent-foreground hover:brightness-110">
                Passer commande
              </button>
              <p className="mt-3 text-center text-[11px] text-muted-foreground">Paiement sécurisé — démo</p>
            </aside>
          </div>
        )}
      </section>
      <Footer />
    </div>
  );
}

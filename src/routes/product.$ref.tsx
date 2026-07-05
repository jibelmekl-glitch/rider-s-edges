import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Header, Footer, useSession, Lock } from "@/components/site/SiteChrome";
import { getProductByRef } from "@/lib/catalog.functions";
import { addToCart } from "@/lib/account.functions";
import { toast } from "sonner";
import { useState } from "react";
import { ChevronRight, Minus, Plus, ShoppingCart } from "lucide-react";

export const Route = createFileRoute("/product/$ref")({
  head: ({ loaderData }) => {
    const p = loaderData as any;
    if (!p) return { meta: [{ title: "Produit introuvable — MOTOBIKE" }, { name: "robots", content: "noindex" }] };
    return {
      meta: [
        { title: `${p.name} — MOTOBIKE` },
        { name: "description", content: p.description ?? p.name },
        { property: "og:title", content: p.name },
        { property: "og:image", content: p.image_url },
      ],
    };
  },
  loader: async ({ params }) => {
    const p = await getProductByRef({ data: { reference: params.ref } });
    if (!p) throw notFound();
    return p;
  },
  component: ProductPage,
  errorComponent: ({ error }) => <div className="p-8">Erreur: {error.message}</div>,
  notFoundComponent: () => <div className="p-8">Produit introuvable.</div>,
});

function ProductPage() {
  const { ref } = Route.useParams();
  const { data: p } = useQuery({ queryKey: ["product", ref], queryFn: () => getProductByRef({ data: { reference: ref } }) });
  const user = useSession();
  const qc = useQueryClient();
  const [qty, setQty] = useState(1);

  const add = useMutation({
    mutationFn: (productId: string) => addToCart({ data: { productId, quantity: qty } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["cart"] }); toast.success("Ajouté au panier"); },
    onError: (e: any) => toast.error(e.message ?? "Erreur"),
  });

  if (!p) return null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <div className="border-b border-border bg-secondary/40">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-6 py-4 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-accent">Accueil</Link>
          <ChevronRight className="h-3 w-3" />
          {p.categories?.slug && (
            <>
              <Link to="/category/$slug" params={{ slug: p.categories.slug }} className="hover:text-accent uppercase">{p.categories.name}</Link>
              <ChevronRight className="h-3 w-3" />
            </>
          )}
          <span className="font-bold uppercase text-brand line-clamp-1">{p.name}</span>
        </div>
      </div>

      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-10 md:grid-cols-2">
        <div className="rounded-md border border-border bg-white p-10">
          <img src={p.image_url || "/images/product-caliper.jpg"} alt={p.name} width={800} height={800} className="mx-auto h-full max-h-[500px] w-full object-contain" />
        </div>
        <div>
          <div className="mb-2 text-xs font-bold uppercase tracking-widest text-brand">{p.brands?.name}</div>
          <h1 className="mb-4 text-3xl font-bold uppercase tracking-tight text-brand">{p.name}</h1>
          {p.tag && <span className={`inline-block rounded px-2 py-1 text-[10px] font-bold uppercase ${p.tag === "NOUVEAUTÉS" ? "bg-destructive text-white" : "bg-promo text-promo-foreground"}`}>{p.tag}</span>}
          <div className="mt-4 space-y-1 text-sm text-muted-foreground">
            <div><span className="font-bold">Référence:</span> {p.reference}</div>
            {p.ean && <div><span className="font-bold">EAN:</span> {p.ean}</div>}
          </div>
          {p.description && <p className="mt-4 text-sm text-foreground">{p.description}</p>}

          <div className="mt-8 rounded-md border border-border bg-card p-6">
            {user ? (
              <>
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-bold text-foreground">{Number(p.price_pro).toFixed(2).replace(".", ",")} €</span>
                  {p.price_old && <span className="text-lg text-muted-foreground line-through">{Number(p.price_old).toFixed(2).replace(".", ",")} €</span>}
                </div>
                <div className="mt-4 flex items-center gap-4">
                  <div className="flex h-12 items-center rounded-md border border-border">
                    <button onClick={() => setQty(Math.max(1, qty - 1))} className="flex h-full w-10 items-center justify-center hover:text-accent"><Minus className="h-4 w-4" /></button>
                    <span className="w-10 text-center font-bold">{qty}</span>
                    <button onClick={() => setQty(qty + 1)} className="flex h-full w-10 items-center justify-center hover:text-accent"><Plus className="h-4 w-4" /></button>
                  </div>
                  <button onClick={() => add.mutate(p.id)} disabled={add.isPending} className="flex h-12 flex-1 items-center justify-center gap-2 rounded-md bg-accent px-6 text-sm font-bold uppercase tracking-wide text-accent-foreground hover:brightness-110 disabled:opacity-60">
                    <ShoppingCart className="h-5 w-5" /> Ajouter au panier
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center">
                <Lock className="mx-auto mb-3 h-6 w-6 text-muted-foreground" />
                <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-brand">Connectez-vous pour voir le prix professionnel</p>
                <Link to="/auth" className="inline-block rounded-md bg-accent px-6 py-3 text-sm font-bold uppercase tracking-wide text-accent-foreground">Se connecter</Link>
              </div>
            )}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}

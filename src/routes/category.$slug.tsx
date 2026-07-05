import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Header, Footer, ProductCard, useSession } from "@/components/site/SiteChrome";
import { getProductsByCategory } from "@/lib/catalog.functions";
import { addToCart } from "@/lib/account.functions";
import { toast } from "sonner";
import { useState } from "react";
import { ChevronRight } from "lucide-react";

export const Route = createFileRoute("/category/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${decodeURIComponent(params.slug)} — MOTOBIKE` },
      { name: "description", content: `Pièces catégorie ${decodeURIComponent(params.slug)} pour deux-roues.` },
    ],
  }),
  loader: ({ params }) => getProductsByCategory({ data: { slug: params.slug } }),
  component: CategoryPage,
  errorComponent: ({ error }) => <div className="p-8">Erreur: {error.message}</div>,
  notFoundComponent: () => <div className="p-8">Catégorie introuvable.</div>,
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const { data } = useQuery({
    queryKey: ["category", slug],
    queryFn: () => getProductsByCategory({ data: { slug } }),
  });
  const user = useSession();
  const qc = useQueryClient();
  const [sort, setSort] = useState<"az" | "priceAsc" | "priceDesc">("az");

  const add = useMutation({
    mutationFn: (productId: string) => addToCart({ data: { productId } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["cart"] }); toast.success("Ajouté au panier"); },
    onError: (e: any) => toast.error(e.message ?? "Erreur"),
  });

  if (!data?.category) throw notFound();

  const products = [...(data.products ?? [])].sort((a: any, b: any) => {
    if (sort === "priceAsc") return Number(a.price_pro) - Number(b.price_pro);
    if (sort === "priceDesc") return Number(b.price_pro) - Number(a.price_pro);
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <div className="border-b border-border bg-secondary/40">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-6 py-4 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-accent">Accueil</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="font-bold uppercase text-brand">{data.category.name}</span>
        </div>
      </div>
      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 flex items-end justify-between">
          <h1 className="text-3xl font-bold uppercase tracking-tight text-brand">{data.category.name}</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{products.length} produit{products.length > 1 ? "s" : ""}</span>
            <select value={sort} onChange={(e) => setSort(e.target.value as any)} className="h-10 rounded-md border border-border bg-background px-3 text-sm">
              <option value="az">Nom A → Z</option>
              <option value="priceAsc">Prix croissant</option>
              <option value="priceDesc">Prix décroissant</option>
            </select>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="rounded-md border border-dashed border-border p-12 text-center text-muted-foreground">
            Aucun produit dans cette catégorie pour le moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((p: any) => (
              <ProductCard key={p.id} p={p} showPrice={!!user} onAdd={(id) => add.mutate(id)} />
            ))}
          </div>
        )}
      </section>
      <Footer />
    </div>
  );
}

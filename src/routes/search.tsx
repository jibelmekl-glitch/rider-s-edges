import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Header, Footer, ProductCard, useSession } from "@/components/site/SiteChrome";
import { searchProducts } from "@/lib/catalog.functions";
import { addToCart } from "@/lib/account.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/search")({
  validateSearch: z.object({ q: z.string().optional().default("") }),
  head: () => ({ meta: [{ title: "Recherche — MOTOBIKE" }] }),
  component: SearchPage,
});

function SearchPage() {
  const { q } = Route.useSearch();
  const user = useSession();
  const qc = useQueryClient();
  const { data: results = [] } = useQuery({
    queryKey: ["search", q], queryFn: () => searchProducts({ data: { q } }), enabled: !!q,
  });
  const add = useMutation({
    mutationFn: (productId: string) => addToCart({ data: { productId } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["cart"] }); toast.success("Ajouté au panier"); },
    onError: (e: any) => toast.error(e.message ?? "Erreur"),
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <section className="mx-auto max-w-7xl px-6 py-10">
        <h1 className="mb-2 text-3xl font-bold uppercase tracking-tight text-brand">Recherche</h1>
        <p className="mb-8 text-sm text-muted-foreground">
          {q ? <>{results.length} résultat{results.length > 1 ? "s" : ""} pour « <span className="font-bold">{q}</span> »</> : "Utilisez la barre de recherche."}
        </p>
        {results.length > 0 && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {results.map((p: any) => (
              <ProductCard key={p.id} p={p} showPrice={!!user} onAdd={(id) => add.mutate(id)} />
            ))}
          </div>
        )}
      </section>
      <Footer />
    </div>
  );
}

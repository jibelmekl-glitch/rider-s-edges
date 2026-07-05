import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Header, Footer } from "@/components/site/SiteChrome";
import { getVehicles } from "@/lib/catalog.functions";
import { addToGarage, getGarage, removeFromGarage } from "@/lib/account.functions";
import { Bike, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/garage")({
  head: () => ({ meta: [{ title: "Mon garage — MOTOBIKE" }] }),
  component: GaragePage,
});

function GaragePage() {
  const qc = useQueryClient();
  const [selectedId, setSelectedId] = useState("");
  const [nickname, setNickname] = useState("");
  const { data: vehicles = [] } = useQuery({ queryKey: ["vehicles"], queryFn: () => getVehicles() });
  const { data: garage = [] } = useQuery({ queryKey: ["garage"], queryFn: () => getGarage() });

  const add = useMutation({
    mutationFn: (v: { vehicleId: string; nickname?: string }) => addToGarage({ data: v }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["garage"] }); toast.success("Véhicule ajouté"); setSelectedId(""); setNickname(""); },
    onError: (e: any) => toast.error(e.message ?? "Erreur"),
  });
  const remove = useMutation({
    mutationFn: (id: string) => removeFromGarage({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["garage"] }),
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <section className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="mb-2 flex items-center gap-3 text-3xl font-bold uppercase tracking-tight text-brand">
          <Bike className="h-8 w-8 text-accent" /> Mon Garage
        </h1>
        <p className="mb-8 text-sm text-muted-foreground">Ajoutez vos deux-roues pour trouver instantanément les pièces compatibles.</p>

        <div className="mb-10 rounded-md border border-border bg-card p-6">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-brand">Ajouter un véhicule</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_1fr_auto]">
            <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)} className="h-11 rounded-md border border-border bg-background px-3">
              <option value="">Choisir un modèle…</option>
              {vehicles.map((v: any) => (
                <option key={v.id} value={v.id}>{v.make} {v.model} ({v.displacement}cc, {v.year_from}-{v.year_to})</option>
              ))}
            </select>
            <input value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="Surnom (facultatif)" className="h-11 rounded-md border border-border bg-background px-3" />
            <button disabled={!selectedId || add.isPending} onClick={() => add.mutate({ vehicleId: selectedId, nickname: nickname || undefined })} className="flex h-11 items-center justify-center gap-2 rounded-md bg-accent px-6 text-sm font-bold uppercase text-accent-foreground disabled:opacity-50">
              <Plus className="h-4 w-4" /> Ajouter
            </button>
          </div>
        </div>

        <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-brand">Mes véhicules ({garage.length})</h2>
        {garage.length === 0 ? (
          <div className="rounded-md border border-dashed border-border p-12 text-center text-muted-foreground">
            Aucun véhicule enregistré.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {garage.map((g: any) => (
              <div key={g.id} className="flex items-center gap-4 rounded-md border border-border bg-card p-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-brand">
                  <Bike className="h-7 w-7" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold uppercase text-brand">{g.vehicles?.make} {g.vehicles?.model}</div>
                  <div className="text-xs text-muted-foreground">{g.vehicles?.displacement}cc · {g.vehicles?.year_from}–{g.vehicles?.year_to}</div>
                  {g.nickname && <div className="mt-1 text-xs italic text-muted-foreground">« {g.nickname} »</div>}
                </div>
                <button onClick={() => remove.mutate(g.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
        )}
      </section>
      <Footer />
    </div>
  );
}

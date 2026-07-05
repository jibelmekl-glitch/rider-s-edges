import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Header, Footer } from "@/components/site/SiteChrome";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Se connecter — MOTOBIKE" },
      { name: "description", content: "Connectez-vous à votre compte professionnel MOTOBIKE pour accéder aux prix et à votre panier." },
    ],
  }),
  component: Auth,
});

function Auth() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email, password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { company_name: company },
          },
        });
        if (error) throw error;
        if (data.session) {
          toast.success("Compte créé — vous êtes connecté.");
          navigate({ to: "/" });
        } else {
          toast.success("Compte créé ! Vérifiez votre email pour confirmer votre inscription, puis connectez-vous.");
          setMode("login");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Bienvenue !");
        navigate({ to: "/" });
      }
    } catch (err: any) {
      toast.error(err.message ?? "Erreur");
    } finally {
      setLoading(false);
    }
  }

  async function google() {
    const res = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (res.error) toast.error("Google: " + (res.error.message ?? "erreur"));
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <div className="mx-auto flex max-w-md flex-col items-center px-6 py-16">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold uppercase tracking-tight text-brand">
            {mode === "login" ? "Connexion Pro" : "Créer un compte"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "login" ? "Accédez à vos prix professionnels et à votre garage." : "Rejoignez le réseau MOTOBIKE Pro."}
          </p>
        </div>

        <form onSubmit={submit} className="w-full space-y-4">
          {mode === "signup" && (
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-brand">Nom de la société</label>
              <input required value={company} onChange={(e) => setCompany(e.target.value)} className="h-11 w-full rounded-md border border-border bg-background px-3 outline-none focus:border-accent" />
            </div>
          )}
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-brand">Email</label>
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-11 w-full rounded-md border border-border bg-background px-3 outline-none focus:border-accent" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-brand">Mot de passe</label>
            <input required minLength={6} type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-11 w-full rounded-md border border-border bg-background px-3 outline-none focus:border-accent" />
          </div>
          <button disabled={loading} type="submit" className="h-11 w-full rounded-md bg-accent text-sm font-bold uppercase tracking-wide text-accent-foreground hover:brightness-110 disabled:opacity-60">
            {loading ? "…" : mode === "login" ? "Se connecter" : "Créer mon compte"}
          </button>
        </form>

        <div className="my-6 flex w-full items-center gap-3 text-xs uppercase text-muted-foreground">
          <div className="h-px flex-1 bg-border" /> ou <div className="h-px flex-1 bg-border" />
        </div>

        <button onClick={google} className="flex h-11 w-full items-center justify-center gap-3 rounded-md border border-border bg-card text-sm font-semibold hover:border-accent">
          <svg viewBox="0 0 48 48" className="h-5 w-5"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.5l6.7-6.7C35.7 2.6 30.3 0 24 0 14.6 0 6.5 5.4 2.5 13.3l7.8 6C12.3 13.4 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.9 7.2l7.6 5.9c4.4-4.1 7.1-10.1 7.1-17.6z"/><path fill="#FBBC05" d="M10.3 28.7c-.5-1.4-.7-2.9-.7-4.7s.3-3.3.7-4.7l-7.8-6C.9 16.3 0 20 0 24s.9 7.7 2.5 10.7l7.8-6z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.1 1.4-4.9 2.3-8.3 2.3-6.3 0-11.7-4-13.6-9.7l-7.8 6C6.5 42.6 14.6 48 24 48z"/></svg>
          Continuer avec Google
        </button>

        <button onClick={() => setMode(mode === "login" ? "signup" : "login")} className="mt-6 text-sm text-brand hover:text-accent">
          {mode === "login" ? "Pas de compte ? Créer un compte" : "Déjà inscrit ? Se connecter"}
        </button>

        <Link to="/" className="mt-4 text-xs text-muted-foreground hover:text-foreground">← Retour à l'accueil</Link>
      </div>
      <Footer />
    </div>
  );
}

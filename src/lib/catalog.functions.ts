import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

function publicClient() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
}

export const getCategories = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data, error } = await sb.from("categories").select("*").order("sort_order");
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getBrands = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data, error } = await sb.from("brands").select("*").order("name");
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getVehicles = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data, error } = await sb.from("vehicles").select("*").order("make");
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getFeaturedProducts = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data, error } = await sb
    .from("products")
    .select("*, brands(slug,name), categories(slug,name)")
    .eq("featured", true)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getProductsByCategory = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => d)
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { data: cat } = await sb.from("categories").select("*").eq("slug", data.slug).maybeSingle();
    if (!cat) return { category: null, products: [] };
    const { data: products, error } = await sb
      .from("products")
      .select("*, brands(slug,name), categories(slug,name)")
      .eq("category_id", cat.id)
      .order("name");
    if (error) throw new Error(error.message);
    return { category: cat, products: products ?? [] };
  });

export const getProductByRef = createServerFn({ method: "GET" })
  .inputValidator((d: { reference: string }) => d)
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { data: product, error } = await sb
      .from("products")
      .select("*, brands(slug,name), categories(slug,name)")
      .eq("reference", data.reference)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return product;
  });

export const searchProducts = createServerFn({ method: "GET" })
  .inputValidator((d: { q: string }) => d)
  .handler(async ({ data }) => {
    const sb = publicClient();
    const q = data.q.trim();
    if (!q) return [];
    const { data: products, error } = await sb
      .from("products")
      .select("*, brands(slug,name), categories(slug,name)")
      .or(`name.ilike.%${q}%,reference.ilike.%${q}%,ean.ilike.%${q}%`)
      .limit(40);
    if (error) throw new Error(error.message);
    return products ?? [];
  });

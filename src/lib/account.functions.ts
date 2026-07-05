import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("profiles")
      .select("*")
      .eq("id", context.userId)
      .maybeSingle();
    return data;
  });

export const getCart = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("cart_items")
      .select("*, products(*, brands(name))")
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const addToCart = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { productId: string; quantity?: number }) => d)
  .handler(async ({ data, context }) => {
    const { data: existing } = await context.supabase
      .from("cart_items")
      .select("id, quantity")
      .eq("user_id", context.userId)
      .eq("product_id", data.productId)
      .maybeSingle();
    if (existing) {
      const { error } = await context.supabase
        .from("cart_items")
        .update({ quantity: existing.quantity + (data.quantity ?? 1) })
        .eq("id", existing.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await context.supabase.from("cart_items").insert({
        user_id: context.userId,
        product_id: data.productId,
        quantity: data.quantity ?? 1,
      });
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const updateCartItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; quantity: number }) => d)
  .handler(async ({ data, context }) => {
    if (data.quantity <= 0) {
      await context.supabase.from("cart_items").delete().eq("id", data.id).eq("user_id", context.userId);
    } else {
      await context.supabase.from("cart_items").update({ quantity: data.quantity }).eq("id", data.id).eq("user_id", context.userId);
    }
    return { ok: true };
  });

export const removeCartItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    await context.supabase.from("cart_items").delete().eq("id", data.id).eq("user_id", context.userId);
    return { ok: true };
  });

export const getGarage = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("user_vehicles")
      .select("*, vehicles(*)")
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const addToGarage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { vehicleId: string; nickname?: string }) => d)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("user_vehicles").insert({
      user_id: context.userId,
      vehicle_id: data.vehicleId,
      nickname: data.nickname ?? null,
    });
    if (error && !error.message.includes("duplicate")) throw new Error(error.message);
    return { ok: true };
  });

export const removeFromGarage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    await context.supabase.from("user_vehicles").delete().eq("id", data.id).eq("user_id", context.userId);
    return { ok: true };
  });

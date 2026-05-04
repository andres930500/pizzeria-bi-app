"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

type ActionResult = {
  ok?: boolean;
  error?: string;
};

function normalizePizzaId(name: string, size: string) {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/_+/g, "_");

  const sizeToken = size.trim().toLowerCase();
  return `${slug || "pizza"}_${sizeToken}`;
}

export async function createLocation(formData: FormData): Promise<void> {
  const city = String(formData.get("city") ?? "").trim();

  if (!city) {
    return;
  }

  const sk_location = randomUUID();
  const location_id = `LOC-${sk_location.slice(0, 8)}`;

  await prisma.dim_Location.create({
    data: {
      sk_location,
      location_id,
      city,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/ventas");
  revalidatePath("/dashboard");

  return;
}

export async function createPizza(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const size = String(formData.get("size") ?? "").trim();
  const price = String(formData.get("price") ?? "").trim();
  const pizzaTypeName = String(formData.get("pizza_type_name") ?? "").trim();
  const pizzaTypeCategory = String(
    formData.get("pizza_type_category") ?? "",
  ).trim();
  const pizzaTypeIngredients = String(
    formData.get("pizza_type_ingredients") ?? "",
  ).trim();

  const allowedSizes = new Set(["S", "M", "L", "XL"]);

  if (!allowedSizes.has(size)) {
    return { ok: false, error: "El tamaño seleccionado no es valido." };
  }

  if (!pizzaTypeName) {
    return { ok: false, error: "El nombre o sabor es requerido." };
  }

  if (!price) {
    return { ok: false, error: "El precio es requerido." };
  }

  const priceValue = Number(price);
  if (!Number.isFinite(priceValue) || priceValue <= 0) {
    return { ok: false, error: "El precio debe ser mayor que cero." };
  }

  let result: ActionResult = { ok: false };

  try {
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const existingType = await tx.dim_Pizza_Type.findFirst({
        where: {
          name: {
            equals: pizzaTypeName,
            mode: "insensitive",
          },
        },
        select: { sk_pizza_type: true },
      });

      let sk_pizza_type = existingType?.sk_pizza_type;

      if (!sk_pizza_type) {
        sk_pizza_type = randomUUID();
        const pizza_type_id = `TYPE-${sk_pizza_type.slice(0, 8)}`;

        await tx.dim_Pizza_Type.create({
          data: {
            sk_pizza_type,
            pizza_type_id,
            name: pizzaTypeName,
            category: pizzaTypeCategory || null,
            ingredients: pizzaTypeIngredients || null,
          },
        });
      }

      const existingPizza = await tx.dim_Pizza.findFirst({
        where: {
          sk_pizza_type,
          size,
        },
        select: { sk_pizza: true },
      });

      if (existingPizza) {
        result = {
          ok: false,
          error: "Ya existe una pizza con ese sabor y tamano.",
        };
        return;
      }

      const sk_pizza = randomUUID();
      const generatedPizzaId = normalizePizzaId(pizzaTypeName, size);

      await tx.dim_Pizza.create({
        data: {
          sk_pizza,
          pizza_id: generatedPizzaId,
          sk_pizza_type,
          size,
          price: String(priceValue),
        },
      });

      result = { ok: true };
    });
  } catch (error) {
    result = {
      ok: false,
      error: "No fue posible guardar la pizza.",
    };
  }

  if (result.ok) {
    revalidatePath("/admin");
    revalidatePath("/ventas");
  }

  return result;
}

export async function updatePizzaType(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const sk_pizza_type = String(formData.get("sk_pizza_type") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const ingredients = String(formData.get("ingredients") ?? "").trim();

  if (!sk_pizza_type) {
    return { ok: false, error: "Sabor invalido." };
  }

  if (!name) {
    return { ok: false, error: "El nombre o sabor es requerido." };
  }

  await prisma.dim_Pizza_Type.update({
    where: { sk_pizza_type },
    data: {
      name,
      category: category || null,
      ingredients: ingredients || null,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/ventas");
  revalidatePath("/dashboard");

  return { ok: true };
}

export async function updatePizzaPrice(formData: FormData): Promise<void> {
  const sk_pizza = String(formData.get("sk_pizza") ?? "").trim();
  const price = String(formData.get("price") ?? "").trim();

  if (!sk_pizza) {
    return;
  }

  const priceValue = Number(price);
  if (!Number.isFinite(priceValue) || priceValue <= 0) {
    return;
  }

  await prisma.dim_Pizza.update({
    where: { sk_pizza },
    data: { price: String(priceValue) },
  });

  revalidatePath("/admin");
  revalidatePath("/ventas");
  revalidatePath("/dashboard");

  return;
}

export async function deletePizza(formData: FormData): Promise<void> {
  const sk_pizza = String(formData.get("sk_pizza") ?? "").trim();

  if (!sk_pizza) {
    return;
  }

  await prisma.dim_Pizza.delete({
    where: { sk_pizza },
  });

  revalidatePath("/admin");
  revalidatePath("/ventas");

  return;
}

export async function deleteLocation(formData: FormData): Promise<void> {
  const sk_location = String(formData.get("sk_location") ?? "").trim();

  if (!sk_location) {
    return;
  }

  await prisma.dim_Location.delete({
    where: { sk_location },
  });

  revalidatePath("/admin");
  revalidatePath("/ventas");
  revalidatePath("/dashboard");

  return;
}

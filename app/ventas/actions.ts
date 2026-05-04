"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

function getDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}${month}${day}`;
}

function getTimeKey(date: Date) {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${hours}${minutes}`;
}

export type CreateSaleState = {
  ok?: boolean;
  error?: string;
};

export async function createSale(
  _prevState: CreateSaleState,
  formData: FormData,
): Promise<CreateSaleState> {
  const quantity = String(formData.get("quantity") ?? "").trim();
  const sk_pizza = String(formData.get("sk_pizza") ?? "").trim();
  const sk_location = String(formData.get("sk_location") ?? "").trim();

  if (!quantity || !sk_pizza || !sk_location) {
    return { ok: false, error: "Missing required fields." };
  }

  const quantityNumber = Number(quantity);
  if (!Number.isFinite(quantityNumber) || quantityNumber <= 0) {
    return { ok: false, error: "Quantity must be greater than zero." };
  }

  const pizza = await prisma.Dim_Pizza.findUnique({
    where: { sk_pizza },
    select: { price: true },
  });

  if (!pizza?.price) {
    return { ok: false, error: "Pizza price not found." };
  }

  const unitPriceNumber = Number(pizza.price);
  if (!Number.isFinite(unitPriceNumber)) {
    return { ok: false, error: "Invalid pizza price." };
  }

  const totalPriceNumber = unitPriceNumber * quantityNumber;

  const now = new Date();
  const sk_date = getDateKey(now);
  const sk_time = getTimeKey(now);

  await prisma.Fact_Sales.create({
    data: {
      order_details_id: randomUUID(),
      sk_pizza,
      sk_location,
      sk_date,
      sk_time,
      quantity: String(quantityNumber),
      unit_price: String(pizza.price),
      total_price: String(totalPriceNumber),
    },
  });

  revalidatePath("/ventas");
  revalidatePath("/dashboard");
  revalidatePath("/");

  return { ok: true };
}

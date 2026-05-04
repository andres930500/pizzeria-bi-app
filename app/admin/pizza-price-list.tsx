"use client";

import { useMemo, useState } from "react";
import { deletePizza, updatePizzaPrice } from "./actions";

type PizzaPriceRow = {
  sk_pizza: string;
  pizza_id: string;
  size: string | null;
  price: string | null;
  label: string;
};

type PizzaPriceListProps = {
  pizzas: PizzaPriceRow[];
};

export function PizzaPriceList({ pizzas }: PizzaPriceListProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return pizzas;
    }

    return pizzas.filter((pizza) => {
      const haystack = [pizza.pizza_id, pizza.size, pizza.label]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalized);
    });
  }, [pizzas, query]);

  return (
    <div className="mt-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Buscar pizza
          </p>
          <p className="text-sm text-slate-500">
            Filtra por SKU, tamaño o categoria.
          </p>
        </div>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Ej. mexicana_l"
          className="w-full max-w-xs rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-slate-400 focus:outline-none"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="mt-6 text-sm text-slate-500">
          No hay pizzas que coincidan con tu busqueda.
        </p>
      ) : (
        <div className="mt-6 max-h-[420px] space-y-3 overflow-y-auto pr-2">
          {filtered.map((pizza) => (
            <div
              key={pizza.sk_pizza}
              className="rounded-2xl border border-slate-100 bg-white/80 p-4 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {pizza.pizza_id}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                      {pizza.size ?? "Sin tamano"}
                    </span>
                    <span>{pizza.label}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Precio actual
                  </p>
                  <p className="text-lg font-semibold text-slate-900">
                    {pizza.price ?? "-"}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <form
                  action={updatePizzaPrice}
                  className="flex flex-wrap items-center gap-2"
                >
                  <input type="hidden" name="sk_pizza" value={pizza.sk_pizza} />
                  <input
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Nuevo precio"
                    className="w-32 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700"
                  />
                  <button
                    type="submit"
                    className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
                  >
                    Guardar
                  </button>
                </form>
                <form action={deletePizza}>
                  <input type="hidden" name="sk_pizza" value={pizza.sk_pizza} />
                  <button
                    type="submit"
                    className="rounded-full border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
                  >
                    Eliminar
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

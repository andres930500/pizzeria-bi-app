"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { updatePizzaType } from "./actions";

type PizzaTypeRow = {
  sk_pizza_type: string;
  name: string;
  category?: string | null;
  ingredients?: string | null;
};

type PizzaTypeListProps = {
  pizzaTypes: PizzaTypeRow[];
};

type UpdatePizzaTypeState = {
  ok?: boolean;
  error?: string;
};

const initialState: UpdatePizzaTypeState = {};

export function PizzaTypeList({ pizzaTypes }: PizzaTypeListProps) {
  const [state, formAction] = useActionState(updatePizzaType, initialState);
  const [activeType, setActiveType] = useState<PizzaTypeRow | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [ingredients, setIngredients] = useState("");

  const isOpen = Boolean(activeType);

  useEffect(() => {
    if (state.ok) {
      setActiveType(null);
    }
  }, [state.ok]);

  useEffect(() => {
    if (!activeType) {
      setName("");
      setCategory("");
      setIngredients("");
      return;
    }

    setName(activeType.name ?? "");
    setCategory(activeType.category ?? "");
    setIngredients(activeType.ingredients ?? "");
  }, [activeType]);

  const rows = useMemo(
    () =>
      pizzaTypes.slice().sort((a, b) => {
        const aLabel = (a.category ?? "") + (a.name ?? "");
        const bLabel = (b.category ?? "") + (b.name ?? "");
        return aLabel.localeCompare(bLabel);
      }),
    [pizzaTypes],
  );

  return (
    <>
      {rows.length === 0 ? (
        <p className="text-sm text-slate-500">No hay sabores registrados.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {rows.map((type) => (
            <div
              key={type.sk_pizza_type}
              className="rounded-2xl border border-slate-100 bg-white/80 p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {type.name || "Sin nombre"}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {type.category || "Sin categoria"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveType(type)}
                  className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Editar
                </button>
              </div>
              <div className="mt-3 rounded-xl border border-slate-100 bg-white px-3 py-2 text-xs text-slate-500">
                {type.ingredients || "Sin ingredientes"}
              </div>
            </div>
          ))}
        </div>
      )}

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                  Editar sabor
                </p>
                <h3 className="mt-2 text-xl font-semibold text-slate-900">
                  {activeType?.name || "Sabor"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveType(null)}
                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Cerrar
              </button>
            </div>

            <p className="mt-4 text-sm text-slate-600">
              Al cambiar estos datos, se actualizarán todas las presentaciones
              (S, M, L, XL) de este sabor.
            </p>

            <form action={formAction} className="mt-6 grid gap-4">
              <input
                type="hidden"
                name="sk_pizza_type"
                value={activeType?.sk_pizza_type ?? ""}
              />
              <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
                Nombre o sabor
                <input
                  name="name"
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
                Categoria
                <input
                  name="category"
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  placeholder="Ej. Premium"
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
                Ingredientes
                <input
                  name="ingredients"
                  value={ingredients}
                  onChange={(event) => setIngredients(event.target.value)}
                  placeholder="Ej. Pollo, jalapeno, queso"
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
                />
              </label>

              {state.ok === false && state.error ? (
                <p className="text-sm font-semibold text-rose-600">
                  {state.error}
                </p>
              ) : null}

              <div className="flex flex-wrap justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveType(null)}
                  className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Guardar cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}

import { prisma } from "@/lib/prisma";
import {
  createLocation,
  deleteLocation,
  deletePizza,
  updatePizzaPrice,
} from "./actions";
import { CatalogForm } from "./catalog-form";
import { PizzaTypeList } from "./pizza-type-list";
import { PizzaPriceList } from "./pizza-price-list";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [locations, pizzas, pizzaTypes] = await Promise.all([
    prisma.Dim_Location.findMany({
      select: {
        sk_location: true,
        location_id: true,
        city: true,
      },
      orderBy: { city: "asc" },
    }),
    prisma.Dim_Pizza.findMany({
      select: {
        sk_pizza: true,
        pizza_id: true,
        size: true,
        price: true,
        sk_pizza_type: true,
      },
      orderBy: { pizza_id: "asc" },
    }),
    prisma.Dim_Pizza_Type.findMany({
      select: {
        sk_pizza_type: true,
        pizza_type_id: true,
        name: true,
        category: true,
        ingredients: true,
      },
      orderBy: { category: "asc" },
    }),
  ]);

  const pizzaTypeLabel = new Map(
    pizzaTypes.map((type) => [
      type.sk_pizza_type,
      type.category
        ? `${type.category}${type.name ? ` - ${type.name}` : ""}`
        : (type.name ?? type.sk_pizza_type),
    ]),
  );

  const pizzaTypeOptions = pizzaTypes.map((type) => ({
    sk_pizza_type: type.sk_pizza_type,
    label: pizzaTypeLabel.get(type.sk_pizza_type) ?? type.sk_pizza_type,
    name: type.name ?? "",
    category: type.category ?? null,
  }));

  const categoryOptions = Array.from(
    new Map(
      pizzaTypes
        .filter((type) => type.category && type.category.trim())
        .map((type) => [
          type.category!.trim().toLowerCase(),
          {
            id: type.pizza_type_id ?? "",
            label: type.category!.trim(),
            value: type.category!.trim(),
          },
        ]),
    ).values(),
  );

  const pizzaSizesByType = pizzas.reduce<Record<string, string[]>>(
    (acc, pizza) => {
      if (!pizza.sk_pizza_type || !pizza.size) {
        return acc;
      }

      const sizes = acc[pizza.sk_pizza_type] ?? [];
      if (!sizes.includes(pizza.size)) {
        sizes.push(pizza.size);
      }

      acc[pizza.sk_pizza_type] = sizes;
      return acc;
    },
    {},
  );

  const totalPizzas = pizzas.length;
  const totalFlavors = pizzaTypes.length;
  const flavorCounts = pizzas.reduce<Record<string, number>>((acc, pizza) => {
    if (!pizza.sk_pizza_type) {
      return acc;
    }
    acc[pizza.sk_pizza_type] = (acc[pizza.sk_pizza_type] ?? 0) + 1;
    return acc;
  }, {});
  const topFlavorEntry = Object.entries(flavorCounts).sort(
    (a, b) => b[1] - a[1],
  )[0];
  const topFlavorLabel = topFlavorEntry
    ? (pizzaTypeLabel.get(topFlavorEntry[0]) ?? topFlavorEntry[0])
    : "Sin datos";

  const pizzaPriceRows = pizzas.map((pizza) => ({
    sk_pizza: pizza.sk_pizza,
    pizza_id: pizza.pizza_id ?? pizza.sk_pizza,
    size: pizza.size ?? null,
    price: pizza.price ?? null,
    label: pizza.sk_pizza_type
      ? (pizzaTypeLabel.get(pizza.sk_pizza_type) ?? pizza.sk_pizza_type)
      : "Sin categoria",
  }));

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(252,211,77,0.18),_rgba(255,255,255,0.9)_40%,_rgba(240,244,255,0.9)_100%)] px-6 py-16 text-slate-900">
      <div className="mx-auto w-full max-w-6xl space-y-12">
        <header className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/70 p-8 shadow-[0_30px_60px_-45px_rgba(15,23,42,0.6)]">
          <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-[radial-gradient(circle,_rgba(244,114,182,0.35),_transparent_70%)]" />
          <div className="pointer-events-none absolute -bottom-28 -left-16 h-56 w-56 rounded-full bg-[radial-gradient(circle,_rgba(56,189,248,0.35),_transparent_70%)]" />
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-rose-500">
            Administracion
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Panel de gestion de catalogo
          </h1>
          <p className="mt-2 max-w-3xl text-base text-slate-600">
            Agrega pizzas, ajusta precios al instante y mantiene el catalogo
            siempre coherente.
          </p>
        </header>

        <section className="rounded-3xl border border-white/70 bg-white/80 p-8 shadow-[0_25px_55px_-40px_rgba(30,41,59,0.45)]">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-amber-600">
                Catalogo
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                Control rapido de pizzas
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-slate-600">
                Crea nuevas presentaciones y ajusta precios sin perder el
                contexto.
              </p>
            </div>
            <div className="rounded-full border border-amber-100 bg-amber-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-amber-700">
              Acciones rapidas
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                Total pizzas
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {totalPizzas}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Presentaciones registradas
              </p>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                Total sabores
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {totalFlavors}
              </p>
              <p className="mt-1 text-xs text-slate-500">Recetas activas</p>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                Sabor dominante
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-900">
                {topFlavorLabel}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Mas presentaciones activas
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.05fr_1fr]">
            <div className="rounded-2xl border border-white/70 bg-white/90 p-6 shadow-[0_20px_40px_-35px_rgba(15,23,42,0.35)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Agregar pizza
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Define sabor, tamanos disponibles y precio de lanzamiento.
                  </p>
                </div>
                <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">
                  Nuevo
                </span>
              </div>
              <CatalogForm
                pizzaTypes={pizzaTypeOptions}
                existingSizesByType={pizzaSizesByType}
                categoryOptions={categoryOptions}
              />
            </div>

            <div className="rounded-2xl border border-white/70 bg-white/90 p-6 shadow-[0_20px_40px_-35px_rgba(15,23,42,0.35)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Actualizar precios
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Cambia valores sin salir del panel principal.
                  </p>
                </div>
                <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
                  Directo
                </span>
              </div>

              <PizzaPriceList pizzas={pizzaPriceRows} />
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_20px_45px_-30px_rgba(15,23,42,0.45)]">
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                Sedes
              </p>
              <h2 className="mt-2 text-xl font-semibold text-slate-900">
                Gestion de sedes
              </h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-100 bg-white/80 p-4">
                <p className="text-sm font-semibold text-slate-900">
                  Nueva sede
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Agrega ciudades habilitadas para ventas.
                </p>
                <form action={createLocation} className="mt-4 space-y-4">
                  <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
                    Ciudad
                    <input
                      name="city"
                      required
                      placeholder="Ej. Medellin"
                      className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
                    />
                  </label>
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Agregar sede
                  </button>
                </form>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-white/80 p-4">
                <p className="text-sm font-semibold text-slate-900">
                  Sedes actuales
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Mantener o eliminar sedes disponibles.
                </p>
                {locations.length === 0 ? (
                  <p className="mt-4 text-sm text-slate-500">
                    No hay sedes registradas.
                  </p>
                ) : (
                  <div className="mt-4 space-y-2">
                    {locations.map((location) => (
                      <div
                        key={location.sk_location}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-100 bg-white px-4 py-3"
                      >
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {location.city ?? "Sin ciudad"}
                          </p>
                          <p className="text-xs text-slate-500">
                            {location.location_id ?? location.sk_location}
                          </p>
                        </div>
                        <form action={deleteLocation}>
                          <input
                            type="hidden"
                            name="sk_location"
                            value={location.sk_location}
                          />
                          <button
                            type="submit"
                            className="rounded-full border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
                          >
                            Eliminar
                          </button>
                        </form>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_20px_45px_-30px_rgba(15,23,42,0.45)]">
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                Sabores
              </p>
              <h2 className="mt-2 text-xl font-semibold text-slate-900">
                Lista de sabores
              </h2>
            </div>
            <PizzaTypeList
              pizzaTypes={pizzaTypes.map((type) => ({
                sk_pizza_type: type.sk_pizza_type,
                name: type.name ?? "",
                category: type.category ?? null,
                ingredients: type.ingredients ?? null,
              }))}
            />
          </div>
        </section>
      </div>
    </div>
  );
}

import { unstable_noStore } from "next/cache";
import { prisma } from "@/lib/prisma";
import { DashboardCharts } from "./charts";
import { DashboardFilter } from "./dashboard-filter";

export const dynamic = "force-dynamic";

type CategorySummary = {
  category: string;
  totalSales: number;
  totalPizzas: number;
};

const currencyFormatter = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat("es-ES");

type DashboardPageProps = {
  searchParams?: Promise<{
    location?: string;
  }>;
};

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  unstable_noStore();
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const [sales, locations, pizzas, pizzaTypes] = await Promise.all([
    prisma.Fact_Sales.findMany({
      select: {
        sk_location: true,
        sk_pizza: true,
        sk_date: true,
        quantity: true,
        total_price: true,
      },
    }),
    prisma.Dim_Location.findMany({
      select: {
        sk_location: true,
        city: true,
        location_id: true,
      },
    }),
    prisma.Dim_Pizza.findMany({
      select: {
        sk_pizza: true,
        sk_pizza_type: true,
      },
    }),
    prisma.Dim_Pizza_Type.findMany({
      select: {
        sk_pizza_type: true,
        category: true,
        name: true,
      },
    }),
  ]);

  const locationLabelByKey = new Map(
    locations.map((location) => [
      location.sk_location,
      location.city ?? location.location_id ?? location.sk_location,
    ]),
  );

  const locationOptions = locations.map((location) => ({
    value: location.sk_location,
    label: location.city ?? location.location_id ?? location.sk_location,
  }));

  const selectedLocation = resolvedSearchParams?.location ?? "";
  const filteredSales = selectedLocation
    ? sales.filter((sale) => sale.sk_location === selectedLocation)
    : sales;

  const pizzaTypeByPizza = new Map(
    pizzas.map((pizza) => [pizza.sk_pizza, pizza.sk_pizza_type ?? ""]),
  );

  const categoryByType = new Map(
    pizzaTypes.map((type) => [
      type.sk_pizza_type,
      type.category ?? type.name ?? "Sin categoria",
    ]),
  );

  let totalSales = 0;
  let totalPizzas = 0;
  const salesByLocation = new Map<string, number>();
  const categoryTotals = new Map<string, CategorySummary>();

  for (const sale of filteredSales) {
    const quantity = Number(sale.quantity ?? 0);
    const totalPrice = Number(sale.total_price ?? 0);

    if (Number.isFinite(quantity)) {
      totalPizzas += quantity;
    }

    if (Number.isFinite(totalPrice)) {
      totalSales += totalPrice;
    }

    if (sale.sk_location) {
      salesByLocation.set(
        sale.sk_location,
        (salesByLocation.get(sale.sk_location) ?? 0) + 1,
      );
    }

    const pizzaTypeKey = sale.sk_pizza
      ? (pizzaTypeByPizza.get(sale.sk_pizza) ?? "")
      : "";
    const category = categoryByType.get(pizzaTypeKey) ?? "Sin categoria";

    const entry = categoryTotals.get(category) ?? {
      category,
      totalSales: 0,
      totalPizzas: 0,
    };

    if (Number.isFinite(quantity)) {
      entry.totalPizzas += quantity;
    }

    if (Number.isFinite(totalPrice)) {
      entry.totalSales += totalPrice;
    }

    categoryTotals.set(category, entry);
  }

  const topLocationEntry = Array.from(salesByLocation.entries()).sort(
    (a, b) => b[1] - a[1],
  )[0];

  const topLocationLabel = topLocationEntry
    ? (locationLabelByKey.get(topLocationEntry[0]) ?? topLocationEntry[0])
    : "Sin datos";

  const categorySummary = Array.from(categoryTotals.values()).sort(
    (a, b) => b.totalSales - a.totalSales,
  );

  const pizzaLabelByKey = new Map(
    pizzas.map((pizza) => [pizza.sk_pizza, pizza.pizza_id ?? pizza.sk_pizza]),
  );
  const pizzaTotals = new Map<string, number>();
  const trendTotals = new Map<string, number>();

  for (const sale of filteredSales) {
    if (sale.sk_pizza) {
      const quantity = Number(sale.quantity ?? 0);
      if (Number.isFinite(quantity)) {
        pizzaTotals.set(
          sale.sk_pizza,
          (pizzaTotals.get(sale.sk_pizza) ?? 0) + quantity,
        );
      }
    }

    const totalPrice = Number(sale.total_price ?? 0);
    if (Number.isFinite(totalPrice)) {
      const dateKey = sale.sk_date ?? "";
      if (dateKey) {
        trendTotals.set(dateKey, (trendTotals.get(dateKey) ?? 0) + totalPrice);
      }
    }
  }

  const topPizzas = Array.from(pizzaTotals.entries())
    .map(([sk_pizza, value]) => ({
      name: pizzaLabelByKey.get(sk_pizza) ?? sk_pizza,
      value,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const trend = Array.from(trendTotals.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([dateKey, value]) => ({
      date:
        dateKey.length === 8
          ? `${dateKey.slice(0, 4)}-${dateKey.slice(4, 6)}-${dateKey.slice(6)}`
          : dateKey,
      value,
    }));

  return (
    <div className="min-h-screen bg-[#FDFCFB] px-6 pb-16 text-slate-900">
      <div className="mx-auto w-full max-w-6xl">
        <header className="mb-10 flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#C53030]">
              Inteligencia de negocio
            </p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              Panel ejecutivo de ventas
            </h1>
            <p className="mt-3 max-w-3xl text-base text-slate-600">
              Monitorea los indicadores principales y el rendimiento por
              categoria para tomar decisiones rapidas.
            </p>
          </div>
          <DashboardFilter
            locations={locationOptions}
            value={selectedLocation}
          />
        </header>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl border border-white/60 bg-white/70 p-6 shadow-[0_18px_45px_-30px_rgba(197,48,48,0.35)] backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#C53030]">
              Total ventas
            </p>
            <p className="mt-4 text-3xl font-semibold text-slate-900">
              {currencyFormatter.format(totalSales)}
            </p>
            <p className="mt-2 text-sm text-slate-500">Ingresos acumulados</p>
          </div>

          <div className="rounded-3xl border border-white/60 bg-white/70 p-6 shadow-[0_18px_45px_-30px_rgba(197,48,48,0.35)] backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#C53030]">
              Pizzas vendidas
            </p>
            <p className="mt-4 text-3xl font-semibold text-slate-900">
              {numberFormatter.format(totalPizzas)}
            </p>
            <p className="mt-2 text-sm text-slate-500">Total de unidades</p>
          </div>

          <div className="rounded-3xl border border-white/60 bg-white/70 p-6 shadow-[0_18px_45px_-30px_rgba(197,48,48,0.35)] backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#C53030]">
              Sede con mas ventas
            </p>
            <p className="mt-4 text-2xl font-semibold text-slate-900">
              {topLocationLabel}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Basado en volumen de tickets
            </p>
          </div>
        </section>

        <section className="mt-10">
          <DashboardCharts
            key={selectedLocation || "all"}
            topPizzas={topPizzas}
            trend={trend}
          />
        </section>

        <section className="mt-10 rounded-3xl border border-white/60 bg-white/70 p-8 shadow-[0_18px_45px_-30px_rgba(197,48,48,0.35)] backdrop-blur">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                Ventas por categoria
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                Resumen de rendimiento
              </h2>
            </div>
            <div className="rounded-full bg-sky-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-sky-700">
              {categorySummary.length} categorias
            </div>
          </div>

          {categorySummary.length === 0 ? (
            <p className="text-sm text-slate-500">
              No hay ventas registradas para mostrar el resumen.
            </p>
          ) : (
            <div className="grid gap-4">
              {categorySummary.map((item) => (
                <div
                  key={item.category}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50/60 px-5 py-4"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {item.category}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {numberFormatter.format(item.totalPizzas)} pizzas vendidas
                    </p>
                  </div>
                  <p className="text-base font-semibold text-slate-900">
                    {currencyFormatter.format(item.totalSales)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

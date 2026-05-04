import { prisma } from "@/lib/prisma";
import { VentasForm } from "./ventas-form";

export default async function VentasPage() {
  const [pizzas, locations, recentSales] = await Promise.all([
    prisma.dim_Pizza.findMany({
      select: {
        sk_pizza: true,
        pizza_id: true,
        size: true,
        price: true,
      },
      orderBy: { pizza_id: "asc" },
    }),
    prisma.dim_Location.findMany({
      select: {
        sk_location: true,
        city: true,
        location_id: true,
      },
      orderBy: { city: "asc" },
    }),
    prisma.fact_Sales.findMany({
      select: {
        order_details_id: true,
        sk_pizza: true,
        sk_location: true,
        total_price: true,
        sk_date: true,
        sk_time: true,
      },
      orderBy: [{ sk_date: "desc" }, { sk_time: "desc" }],
      take: 5,
    }),
  ]);

  const pizzaOptions = pizzas.map((pizza) => {
    const label = [
      pizza.pizza_id ?? pizza.sk_pizza,
      pizza.size ? `(${pizza.size})` : null,
      pizza.price ? `$${pizza.price}` : null,
    ]
      .filter(Boolean)
      .join(" ");

    return { value: pizza.sk_pizza, label };
  });

  const locationOptions = locations.map((location) => {
    const label = location.city ?? location.location_id ?? location.sk_location;

    return { value: location.sk_location, label };
  });

  const pizzaLabelByKey = new Map(
    pizzaOptions.map((pizza) => [pizza.value, pizza.label]),
  );
  const locationLabelByKey = new Map(
    locationOptions.map((location) => [location.value, location.label]),
  );

  const currencyFormatter = new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });

  return (
    <div className="min-h-screen bg-[#FDFCFB] px-6 pb-16 text-slate-900">
      <div className="mx-auto w-full max-w-4xl">
        <header className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#C53030]">
            Ventas
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
            Registro de ventas en tiempo real
          </h1>
          <p className="mt-3 max-w-2xl text-base text-zinc-600">
            Selecciona la pizza, la sede y la cantidad para crear una nueva
            venta en el sistema.
          </p>
        </header>

        <div className="rounded-3xl border border-white/60 bg-white/70 p-8 shadow-[0_25px_60px_-40px_rgba(197,48,48,0.35)] backdrop-blur sm:p-10">
          <VentasForm pizzas={pizzaOptions} locations={locationOptions} />
        </div>

        <div className="mt-8 rounded-3xl border border-white/60 bg-white/70 p-8 shadow-[0_25px_60px_-40px_rgba(197,48,48,0.3)] backdrop-blur">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#C53030]">
                Ultimas ventas
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-zinc-900">
                Registro reciente
              </h2>
            </div>
            <p className="text-xs text-zinc-500">
              Actualizado automaticamente al registrar.
            </p>
          </div>

          {recentSales.length === 0 ? (
            <p className="text-sm text-zinc-500">
              Aun no hay ventas registradas.
            </p>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-zinc-100">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-50 text-xs uppercase tracking-[0.2em] text-zinc-500">
                  <tr>
                    <th className="px-4 py-3">Pizza</th>
                    <th className="px-4 py-3">Sede</th>
                    <th className="px-4 py-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {recentSales.map((sale) => {
                    const pizzaLabel = sale.sk_pizza
                      ? (pizzaLabelByKey.get(sale.sk_pizza) ?? sale.sk_pizza)
                      : "Sin pizza";
                    const locationLabel = sale.sk_location
                      ? (locationLabelByKey.get(sale.sk_location) ??
                        sale.sk_location)
                      : "Sin sede";
                    const totalValue = Number(sale.total_price ?? 0);

                    return (
                      <tr key={sale.order_details_id}>
                        <td className="px-4 py-3 font-medium text-zinc-900">
                          {pizzaLabel}
                        </td>
                        <td className="px-4 py-3 text-zinc-600">
                          {locationLabel}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-zinc-900">
                          {Number.isFinite(totalValue)
                            ? currencyFormatter.format(totalValue)
                            : "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

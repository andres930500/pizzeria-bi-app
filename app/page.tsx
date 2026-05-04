import Link from "next/link";
import { ArrowUpRight, Ticket } from "lucide-react";
import { prisma } from "@/lib/prisma";

const currencyFormatter = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

function getDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}${month}${day}`;
}

function getGreeting(date: Date) {
  const hour = date.getHours();
  if (hour < 12) {
    return "Buenos dias";
  }
  if (hour < 18) {
    return "Buenas tardes";
  }
  return "Buenas noches";
}

export default async function Home() {
  const now = new Date();
  const todayKey = getDateKey(now);
  const salesToday = await prisma.Fact_Sales.findMany({
    where: { sk_date: todayKey },
    select: { total_price: true },
  });

  const totalToday = salesToday.reduce((sum, sale) => {
    const value = Number(sale.total_price ?? 0);
    return Number.isFinite(value) ? sum + value : sum;
  }, 0);

  const greeting = getGreeting(now);
  const trendUp = totalToday > 0;

  return (
    <div className="mx-auto w-full max-w-6xl px-6 pb-16">
      <section className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
          {greeting}
        </p>
        <h1 className="mt-3 text-4xl font-bold text-slate-900">
          Bienvenido al panel ejecutivo de tu pizzeria.
        </h1>
        <p className="mt-3 max-w-3xl text-base text-slate-600">
          Toma decisiones rapidas con un vistazo a ventas, tendencias y acciones
          criticas.
        </p>
      </section>

      <section className="mt-10 grid gap-6 md:grid-cols-2">
        <Link
          href="/ventas"
          className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:scale-[1.02]"
        >
          <div className="absolute -right-16 -top-16 h-32 w-32 rounded-full bg-[#F7C9B4]/50 blur-2xl" />
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#C75B3A]">
            Acceso rapido
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-900">
            Registrar venta
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Captura pedidos con un flujo simple y rapido.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#C75B3A] text-white shadow-sm">
              <Ticket className="h-5 w-5" />
            </span>
            <span className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white">
              Ir a ventas
            </span>
          </div>
        </Link>

        <Link
          href="/dashboard"
          className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:scale-[1.02]"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
            BI diario
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-900">
            Ver Dashboard
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Tendencias, sedes top y categorias clave.
          </p>
          <div className="mt-6 h-24 rounded-2xl bg-slate-50 p-4">
            <div className="flex h-full items-end gap-2">
              <span className="h-6 w-3 rounded-full bg-slate-300" />
              <span className="h-10 w-3 rounded-full bg-slate-400" />
              <span className="h-16 w-3 rounded-full bg-[#C75B3A]" />
              <span className="h-9 w-3 rounded-full bg-slate-400" />
              <span className="h-12 w-3 rounded-full bg-slate-300" />
              <span className="h-14 w-3 rounded-full bg-slate-500" />
            </div>
          </div>
        </Link>
      </section>

      <section className="mt-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              Ventas del dia
            </p>
            <p className="mt-3 text-3xl font-bold text-slate-900 font-mono">
              {currencyFormatter.format(totalToday)}
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Total de ventas registradas en la fecha actual.
            </p>
          </div>
          <span
            className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
              trendUp
                ? "bg-emerald-50 text-emerald-700"
                : "bg-rose-50 text-rose-600"
            }`}
          >
            <ArrowUpRight className="h-3.5 w-3.5" />
            {trendUp ? "En alza" : "En baja"}
          </span>
        </div>
      </section>
    </div>
  );
}

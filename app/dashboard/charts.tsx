"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type TopPizzaDatum = {
  name: string;
  value: number;
};

type TrendDatum = {
  date: string;
  value: number;
};

type DashboardChartsProps = {
  topPizzas: TopPizzaDatum[];
  trend: TrendDatum[];
};

export function DashboardCharts({ topPizzas, trend }: DashboardChartsProps) {
  return (
    <section className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-3xl border border-white/60 bg-white/70 p-6 shadow-[0_18px_45px_-30px_rgba(197,48,48,0.35)] backdrop-blur">
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            Top 5 pizzas
          </p>
          <h3 className="mt-2 text-xl font-semibold text-slate-900">
            Mas vendidas
          </h3>
        </div>
        <div className="h-[350px] w-full">
          {topPizzas.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-slate-500">
                No hay datos suficientes para mostrar la grafica.
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topPizzas} margin={{ left: 12, right: 12 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  cursor={{ fill: "rgba(226,232,240,0.4)" }}
                  contentStyle={{
                    borderRadius: 12,
                    borderColor: "#e2e8f0",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="value" fill="#F6AD55" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="rounded-3xl border border-white/60 bg-white/70 p-6 shadow-[0_18px_45px_-30px_rgba(197,48,48,0.35)] backdrop-blur">
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            Tendencia de ventas
          </p>
          <h3 className="mt-2 text-xl font-semibold text-slate-900">
            Total por fecha
          </h3>
        </div>
        <div className="h-[350px] w-full">
          {trend.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-slate-500">
                No hay datos suficientes para mostrar la grafica.
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend} margin={{ left: 12, right: 12 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  cursor={{ stroke: "#94a3b8" }}
                  contentStyle={{
                    borderRadius: 12,
                    borderColor: "#e2e8f0",
                    fontSize: "12px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#C53030"
                  strokeWidth={3}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </section>
  );
}

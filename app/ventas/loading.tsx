export default function VentasLoading() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(254,243,199,0.65),_rgba(248,250,252,0.9)_50%,_rgba(244,244,245,1)_100%)] px-6 py-16 text-zinc-900">
      <div className="mx-auto w-full max-w-4xl">
        <header className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-600">
            Ventas
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
            Registro de ventas en tiempo real
          </h1>
          <p className="mt-3 max-w-2xl text-base text-zinc-600">
            Estamos preparando los datos de pizzas y sedes.
          </p>
        </header>

        <div className="rounded-3xl border border-white/60 bg-white/90 p-8 shadow-[0_25px_60px_-40px_rgba(15,23,42,0.45)] backdrop-blur sm:p-10">
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm font-semibold text-zinc-700">
                <span className="flex items-center gap-2">
                  <span className="text-lg">🍕</span>
                  Pizza
                </span>
                <select
                  disabled
                  className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 shadow-sm"
                >
                  <option>Cargando...</option>
                </select>
              </label>

              <label className="flex flex-col gap-2 text-sm font-semibold text-zinc-700">
                <span className="flex items-center gap-2">
                  <span className="text-lg">🏪</span>
                  Sede
                </span>
                <select
                  disabled
                  className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 shadow-sm"
                >
                  <option>Cargando...</option>
                </select>
              </label>
            </div>

            <label className="flex flex-col gap-2 text-sm font-semibold text-zinc-700">
              Cantidad
              <input
                disabled
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 shadow-sm"
              />
            </label>

            <div className="flex flex-col items-start gap-3 border-t border-zinc-100 pt-6">
              <button
                disabled
                className="inline-flex items-center justify-center rounded-lg bg-zinc-300 px-5 py-2.5 text-sm font-semibold text-white"
              >
                Cargando...
              </button>
              <p className="text-xs text-zinc-500">
                Guardamos la venta con la fecha y hora actuales.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

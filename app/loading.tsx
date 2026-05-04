export default function AppLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(219,234,254,0.5),_rgba(248,250,252,0.95)_45%,_rgba(240,245,250,1)_100%)] px-6 text-slate-900">
      <div className="flex flex-col items-center gap-4 rounded-3xl border border-white/70 bg-white/90 px-8 py-10 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.45)]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-sky-500" />
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-700">
            Cargando
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Estamos preparando los datos del panel.
          </p>
        </div>
      </div>
    </div>
  );
}

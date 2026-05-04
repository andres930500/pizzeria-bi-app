"use client";

import { useEffect } from "react";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AppError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(254,243,199,0.5),_rgba(248,250,252,0.95)_45%,_rgba(240,245,249,1)_100%)] px-6 text-slate-900">
      <div className="w-full max-w-md rounded-3xl border border-white/70 bg-white/90 p-8 text-center shadow-[0_18px_45px_-30px_rgba(15,23,42,0.45)]">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-600">
          Ocurrio un problema
        </p>
        <h1 className="mt-3 text-2xl font-semibold text-slate-900">
          No pudimos cargar esta vista
        </h1>
        <p className="mt-3 text-sm text-slate-500">
          Intenta nuevamente. Si el problema persiste, revisa la conexion con la
          base de datos.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Reintentar
        </button>
      </div>
    </div>
  );
}

"use client";

import { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type LocationOption = {
  value: string;
  label: string;
};

type DashboardFilterProps = {
  locations: LocationOption[];
  value: string;
};

export function DashboardFilter({ locations, value }: DashboardFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handleChange = (nextValue: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (nextValue) {
      params.set("location", nextValue);
    } else {
      params.delete("location");
    }

    const query = params.toString();
    startTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname);
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
        Sede
      </label>
      <select
        value={value}
        onChange={(event) => handleChange(event.target.value)}
        disabled={isPending}
        className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm transition focus:border-slate-400 focus:outline-none"
      >
        <option value="">Todas</option>
        {locations.map((location) => (
          <option key={location.value} value={location.value}>
            {location.label}
          </option>
        ))}
      </select>
    </div>
  );
}

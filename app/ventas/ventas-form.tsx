"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { CreateSaleState } from "./actions";
import { createSale } from "./actions";
import { SubmitButton } from "./submit-button";

type Option = {
  value: string;
  label: string;
};

type VentasFormProps = {
  pizzas: Option[];
  locations: Option[];
};

const initialState: CreateSaleState = {};

export function VentasForm({ pizzas, locations }: VentasFormProps) {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [state, formAction] = useActionState(createSale, initialState);
  const [isHydrated, setIsHydrated] = useState(false);
  const [skPizza, setSkPizza] = useState("");
  const [skLocation, setSkLocation] = useState("");
  const [quantity, setQuantity] = useState("1");

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
      setSkPizza("");
      setSkLocation("");
      setQuantity("1");
      toast.success("Venta registrada con exito.");
      return;
    }
    if (state.ok === false && state.error) {
      toast.error(state.error);
    }
  }, [state.error, state.ok]);

  const pizzaLoading = !isHydrated || pizzas.length === 0;
  const locationLoading = !isHydrated || locations.length === 0;

  const quantityNumber = Number(quantity);
  const isInvalid =
    pizzaLoading ||
    locationLoading ||
    !skPizza ||
    !skLocation ||
    !Number.isFinite(quantityNumber) ||
    quantityNumber < 1;

  return (
    <form ref={formRef} action={formAction} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm font-semibold text-zinc-700">
          <span className="flex items-center gap-2">
            <span className="text-lg">🍕</span>
            Pizza
          </span>
          <select
            name="sk_pizza"
            required
            disabled={pizzaLoading}
            className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 shadow-sm transition focus:border-zinc-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-70"
            value={skPizza}
            onChange={(event) => setSkPizza(event.target.value)}
          >
            {pizzaLoading ? (
              <option value="">Cargando...</option>
            ) : (
              <>
                <option value="" disabled>
                  Selecciona una pizza
                </option>
                {pizzas.map((pizza) => (
                  <option key={pizza.value} value={pizza.value}>
                    {pizza.label}
                  </option>
                ))}
              </>
            )}
          </select>
        </label>

        <label className="flex flex-col gap-2 text-sm font-semibold text-zinc-700">
          <span className="flex items-center gap-2">
            <span className="text-lg">🏪</span>
            Sede
          </span>
          <select
            name="sk_location"
            required
            disabled={locationLoading}
            className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 shadow-sm transition focus:border-zinc-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-70"
            value={skLocation}
            onChange={(event) => setSkLocation(event.target.value)}
          >
            {locationLoading ? (
              <option value="">Cargando...</option>
            ) : (
              <>
                <option value="" disabled>
                  Selecciona una sede
                </option>
                {locations.map((location) => (
                  <option key={location.value} value={location.value}>
                    {location.label}
                  </option>
                ))}
              </>
            )}
          </select>
        </label>
      </div>

      <label className="flex flex-col gap-2 text-sm font-semibold text-zinc-700">
        Cantidad
        <input
          type="number"
          name="quantity"
          min={1}
          required
          value={quantity}
          onChange={(event) => setQuantity(event.target.value)}
          className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 shadow-sm transition focus:border-zinc-400 focus:outline-none"
        />
      </label>

      <div className="flex flex-col items-start gap-3 border-t border-zinc-100 pt-6">
        <SubmitButton disabled={isInvalid} />
        <p className="text-xs text-zinc-500">
          Guardamos la venta con la fecha y hora actuales.
        </p>
      </div>
    </form>
  );
}

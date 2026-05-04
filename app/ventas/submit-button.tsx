"use client";

import { Check, Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";

type SubmitButtonProps = {
  disabled?: boolean;
};

export function SubmitButton({ disabled }: SubmitButtonProps) {
  const { pending } = useFormStatus();
  const isDisabled = pending || disabled;

  return (
    <button
      type="submit"
      disabled={isDisabled}
      aria-label="Registrar venta"
      className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#C53030] text-white shadow transition hover:bg-[#A12828] disabled:cursor-not-allowed disabled:bg-[#C53030]/50"
    >
      {pending ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <Check className="h-5 w-5" />
      )}
      <span className="sr-only">Registrar venta</span>
    </button>
  );
}

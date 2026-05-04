"use client";

import { Combobox } from "@headlessui/react";
import { useActionState, useEffect, useMemo, useState } from "react";
import { createPizza } from "./actions";

type PizzaTypeOption = {
  sk_pizza_type: string;
  label: string;
  name: string;
  category?: string | null;
};

type CategoryOption = {
  id: string;
  label: string;
  value: string;
};

type CatalogFormProps = {
  pizzaTypes: PizzaTypeOption[];
  existingSizesByType: Record<string, string[]>;
  categoryOptions: CategoryOption[];
};

type CreatePizzaState = {
  ok?: boolean;
  error?: string;
};

const initialState: CreatePizzaState = {};

const sizeOptions = [
  { value: "S", label: "S (Personal)" },
  { value: "M", label: "M (Mediana)" },
  { value: "L", label: "L (Grande)" },
  { value: "XL", label: "XL (Familiar)" },
];

function normalizeSkuPart(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/_+/g, "_");
}

function generateSku(flavorName: string, size: string) {
  if (!flavorName || !size) {
    return "";
  }

  const flavorToken = normalizeSkuPart(flavorName);
  const sizeToken = normalizeSkuPart(size);

  if (!flavorToken || !sizeToken) {
    return "";
  }

  return `${flavorToken}_${sizeToken}`;
}

export function CatalogForm({
  pizzaTypes,
  existingSizesByType,
  categoryOptions,
}: CatalogFormProps) {
  const [state, formAction] = useActionState(createPizza, initialState);
  const [typeName, setTypeName] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [customIngredients, setCustomIngredients] = useState("");
  const [categoryQuery, setCategoryQuery] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryOption | null>(null);

  const matchedType = useMemo(() => {
    const normalized = typeName.trim().toLowerCase();
    if (!normalized) {
      return null;
    }

    return (
      pizzaTypes.find(
        (type) => type.name.trim().toLowerCase() === normalized,
      ) ?? null
    );
  }, [pizzaTypes, typeName]);

  const existingSizes = useMemo(() => {
    if (!matchedType?.sk_pizza_type) {
      return new Set<string>();
    }

    return new Set(existingSizesByType[matchedType.sk_pizza_type] ?? []);
  }, [existingSizesByType, matchedType?.sk_pizza_type]);

  const isDuplicateSize = Boolean(
    matchedType && selectedSize && existingSizes.has(selectedSize),
  );

  const sku = useMemo(
    () => generateSku(matchedType?.name ?? typeName, selectedSize),
    [matchedType?.name, selectedSize, typeName],
  );

  const showExtraFields = !matchedType && Boolean(typeName.trim());

  useEffect(() => {
    if (!showExtraFields) {
      setCategoryQuery("");
      setSelectedCategory(null);
    }
  }, [showExtraFields]);

  const normalizedCategoryQuery = categoryQuery.trim().toLowerCase();
  const filteredCategories = useMemo(() => {
    if (!normalizedCategoryQuery) {
      return categoryOptions;
    }

    return categoryOptions.filter((option) =>
      option.label.toLowerCase().includes(normalizedCategoryQuery),
    );
  }, [categoryOptions, normalizedCategoryQuery]);

  const hasExactCategoryMatch = useMemo(
    () =>
      Boolean(
        normalizedCategoryQuery &&
        categoryOptions.some(
          (option) => option.label.toLowerCase() === normalizedCategoryQuery,
        ),
      ),
    [categoryOptions, normalizedCategoryQuery],
  );

  const showCreateCategory =
    Boolean(normalizedCategoryQuery) && !hasExactCategoryMatch;
  const categoryValue = selectedCategory?.label ?? categoryQuery;
  const categoryId = selectedCategory?.id ?? "";

  return (
    <form action={formAction} className="mt-6 grid gap-4">
      <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
        Codigo de pizza
        <input
          name="pizza_id"
          readOnly
          value={sku}
          placeholder="Selecciona categoria y tamaño"
          className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
        />
        <span className="text-xs text-slate-500">
          El SKU se genera automaticamente para garantizar la consistencia en
          los reportes de BI.
        </span>
      </label>

      <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
        Tamaño
        <select
          name="size"
          required
          value={selectedSize}
          onChange={(event) => setSelectedSize(event.target.value)}
          className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
        >
          <option value="" disabled>
            Selecciona un tamaño
          </option>
          {sizeOptions.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={matchedType ? existingSizes.has(option.value) : false}
            >
              {option.label}
            </option>
          ))}
        </select>
        {matchedType ? (
          <span className="text-xs text-slate-500">
            Los tamaños existentes se bloquean automaticamente.
          </span>
        ) : null}
      </label>

      <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
        Nombre o sabor
        <input
          name="pizza_type_name"
          value={typeName}
          onChange={(event) => setTypeName(event.target.value)}
          placeholder="Ej. Mexicana"
          list="pizza-type-options"
          required
          className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
        />
        <datalist id="pizza-type-options">
          {pizzaTypes.map((type) => (
            <option key={type.sk_pizza_type} value={type.name} />
          ))}
        </datalist>
      </label>

      {showExtraFields ? (
        <>
          <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
            Ingredientes
            <input
              name="pizza_type_ingredients"
              value={customIngredients}
              onChange={(event) => setCustomIngredients(event.target.value)}
              placeholder="Ej. Pollo, jalapeño, queso"
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
            Categoria de sabor
            <Combobox value={selectedCategory} onChange={setSelectedCategory}>
              <div className="relative">
                <Combobox.Input
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
                  placeholder="Ej. Classic"
                  displayValue={(option: CategoryOption | null) =>
                    option?.label ?? categoryQuery
                  }
                  onChange={(event) => {
                    setCategoryQuery(event.target.value);
                    setSelectedCategory(null);
                  }}
                />
                {(filteredCategories.length > 0 || showCreateCategory) && (
                  <Combobox.Options className="absolute z-10 mt-2 max-h-60 w-full overflow-auto rounded-xl border border-slate-200 bg-white p-1 text-sm shadow-lg">
                    {filteredCategories.map((option) => (
                      <Combobox.Option
                        key={option.value}
                        value={option}
                        className={({ active }) =>
                          `cursor-pointer rounded-lg px-3 py-2 text-sm ${
                            active
                              ? "bg-slate-900 text-white"
                              : "text-slate-700"
                          }`
                        }
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">{option.label}</span>
                          <span className="text-xs text-slate-400">
                            Existente
                          </span>
                        </div>
                      </Combobox.Option>
                    ))}
                    {showCreateCategory ? (
                      <Combobox.Option
                        value={{
                          id: "",
                          label: categoryQuery.trim(),
                          value: categoryQuery.trim(),
                        }}
                        className={({ active }) =>
                          `cursor-pointer rounded-lg px-3 py-2 text-sm ${
                            active
                              ? "bg-amber-500 text-white"
                              : "text-amber-700"
                          }`
                        }
                      >
                        Crear nueva categoria: {categoryQuery.trim()}
                      </Combobox.Option>
                    ) : null}
                  </Combobox.Options>
                )}
              </div>
            </Combobox>
            <input
              type="hidden"
              name="pizza_type_category"
              value={categoryValue}
            />
            <input type="hidden" name="pizza_type_id" value={categoryId} />
          </label>
        </>
      ) : null}

      <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
        Precio
        <input
          name="price"
          type="number"
          step="0.01"
          min="0"
          required
          placeholder="Ej. 32.00"
          className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
        />
      </label>
      {isDuplicateSize ? (
        <p className="text-sm font-semibold text-rose-600">
          Esta combinacion de sabor y tamano ya existe en el catalogo.
        </p>
      ) : null}
      {state.ok === false && state.error ? (
        <p className="text-sm font-semibold text-rose-600">{state.error}</p>
      ) : null}
      <button
        type="submit"
        className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
        disabled={!sku || !typeName.trim() || isDuplicateSize}
      >
        Agregar pizza
      </button>
    </form>
  );
}

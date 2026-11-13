"use client";

import { SORTS, type Sort } from "@/lib/listing-params";

/** Belongs to the filters form via `form=`; applies on change. */
export function SortSelect({ formId, value }: { formId: string; value: Sort }) {
  return (
    <label className="text-sm">
      <span className="sr-only">Сортування</span>
      <select
        name="sort"
        form={formId}
        defaultValue={value}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className="rounded-lg border border-line bg-page px-4 py-2.5 text-sm"
      >
        {Object.entries(SORTS).map(([v, label]) => (
          <option key={v} value={v}>
            {label}
          </option>
        ))}
      </select>
    </label>
  );
}

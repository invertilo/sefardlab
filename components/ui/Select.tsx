"use client";

import { useId, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { fieldClasses } from "./Input";

export type SelectOption = { value: string; label: string; disabled?: boolean };

type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "id"> & {
  label: string;
  options: SelectOption[];
  placeholder?: string;
  hint?: string;
  error?: string;
  id?: string;
};

export function Select({
  label,
  options,
  placeholder,
  hint,
  error,
  id,
  className,
  defaultValue,
  ...props
}: SelectProps) {
  const autoId = useId();
  const selectId = id ?? autoId;
  const hintId = hint ? `${selectId}-hint` : undefined;
  const errorId = error ? `${selectId}-error` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={selectId} className="text-sm font-medium text-text">
        {label}
      </label>
      <div className="relative">
        <select
          id={selectId}
          className={cn(fieldClasses, "cursor-pointer appearance-none pr-10", className)}
          aria-invalid={error ? true : undefined}
          aria-describedby={cn(hintId, errorId) || undefined}
          defaultValue={defaultValue ?? (placeholder ? "" : undefined)}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((o) => (
            <option key={o.value} value={o.value} disabled={o.disabled}>
              {o.label}
            </option>
          ))}
        </select>
        <svg
          className="pointer-events-none absolute right-3 top-1/2 size-5 -translate-y-1/2 text-muted"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
      {hint && !error && (
        <p id={hintId} className="text-sm text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-sm font-medium text-accent-strong">
          {error}
        </p>
      )}
    </div>
  );
}

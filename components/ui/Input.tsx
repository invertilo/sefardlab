"use client";

import { useId, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const fieldClasses = cn(
  "w-full min-h-11 rounded-lg border-[1.5px] border-border-strong bg-surface px-3.5 text-base text-text",
  "placeholder:text-muted/80 transition-colors duration-150",
  "hover:border-primary focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-1",
  "disabled:cursor-not-allowed disabled:opacity-60",
  "aria-[invalid=true]:border-accent-strong",
);

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id"> & {
  label: string;
  hint?: string;
  error?: string;
  id?: string;
};

export function Input({ label, hint, error, id, className, ...props }: InputProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-medium text-text">
        {label}
      </label>
      <input
        id={inputId}
        className={cn(fieldClasses, className)}
        aria-invalid={error ? true : undefined}
        aria-describedby={cn(hintId, errorId) || undefined}
        {...props}
      />
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

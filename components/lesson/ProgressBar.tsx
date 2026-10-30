import { cn } from "@/lib/utils";

type ProgressBarProps = {
  /** 0–1 */
  value: number;
  label: string;
  className?: string;
};

export function ProgressBar({ value, label, className }: ProgressBarProps) {
  const percent = Math.round(Math.min(Math.max(value, 0), 1) * 100);
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      className={cn("h-2.5 overflow-hidden rounded-full bg-surface-sunken", className)}
    >
      <span
        className="block h-full rounded-full bg-secondary transition-[width] duration-500 ease-out-soft"
        // Un mínimo visible para que la barra no parezca rota al empezar.
        style={{ width: `${Math.max(percent, 4)}%` }}
      />
    </div>
  );
}

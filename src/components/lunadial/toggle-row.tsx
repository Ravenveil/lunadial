"use client";

export function ToggleRow({
  icon,
  label,
  on,
  onToggle,
  el,
}: {
  icon?: React.ReactNode;
  label: string;
  on: boolean;
  onToggle: () => void;
  el: string;
}) {
  return (
    <div className="flex items-center justify-between py-3.5" data-el={el}>
      <span className="flex items-center gap-2 text-sm text-foreground">
        {icon}
        {label}
      </span>
      <button
        type="button"
        onClick={onToggle}
        role="switch"
        aria-checked={on}
        className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition-colors duration-200 ${
          on
            ? "border-primary bg-primary"
            : "border-border bg-secondary"
        }`}
      >
        <span
          className={`inline-block h-5 w-5 rounded-full shadow-sm transition-transform duration-200 ${
            on
              ? "translate-x-[22px] bg-primary-foreground"
              : "translate-x-[3px] bg-moon"
          }`}
        />
      </button>
    </div>
  );
}

import { cn } from "@/lib/utils";

type ToggleSwitchProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  id?: string;
};

export function ToggleSwitch({ checked, onChange, disabled, id }: ToggleSwitchProps) {
  return (
    <label className={cn("relative inline-flex cursor-pointer items-center", disabled && "opacity-50")}>
      <input
        id={id}
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="h-6 w-11 rounded-full bg-outline-variant transition-colors peer-checked:bg-secondary peer-focus-visible:ring-2 peer-focus-visible:ring-secondary/20 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all peer-checked:after:translate-x-full" />
    </label>
  );
}

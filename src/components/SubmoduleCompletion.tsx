import { Checkbox } from "@/components/ui/checkbox";
import type { Submodule } from "@/lib/content/types";
import type { ProgressMap } from "@/lib/progress";

interface Props {
  moduleId: string;
  submodule: Submodule;
  progress: ProgressMap;
  onToggle: (submoduleId: string, done: boolean) => void;
  checkLabel: string;
  checked: boolean;
}

export default function SubmoduleCompletion({
  submodule,
  onToggle,
  checkLabel,
  checked,
}: Props) {
  const id = `complete-${submodule.id}`;

  return (
    <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-gradient-to-r from-primary/[0.08] to-transparent px-4 py-3 shadow-[0_4px_20px_-6px_oklch(0.42_0.115_162_/_0.15)]">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(val) => onToggle(submodule.id, !!val)}
        className="mt-0.5 shrink-0"
      />
      <label
        htmlFor={id}
        className="cursor-pointer select-none text-sm leading-snug text-foreground/80"
      >
        {checkLabel}
      </label>
    </div>
  );
}

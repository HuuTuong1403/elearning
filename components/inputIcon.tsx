import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { Input } from "./ui/input";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  side: "left" | "right";
  icon: LucideIcon;
  onClickIcon?: () => void;
}

export const InputIcon = ({
  side,
  icon: Icon,
  onClickIcon,
  ...props
}: InputProps) => {
  return (
    <div className="relative">
      {Icon && (
        <div
          className={cn(
            "absolute inset-y-0  flex items-center cursor-pointer text-slate-500 hover:text-slate-700 transition",
            side === "left" && "left-2",
            side === "right" && "right-2"
          )}
          onClick={onClickIcon}
        >
          <Icon className="h-[20px] w-[20px]" />
        </div>
      )}
      <Input
        {...props}
        className={cn(
          props.className,
          side === "left" && "pl-[30px]",
          side === "right" && "pr-[30px]"
        )}
      />
    </div>
  );
};

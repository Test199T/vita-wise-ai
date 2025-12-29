import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export type LinkItemType = {
    label: string;
    href: string;
    icon: LucideIcon;
    description?: string;
};

export function LinkItem({
    label,
    description,
    icon: Icon,
    className,
    href,
    ...props
}: React.ComponentProps<"a"> & LinkItemType) {
    return (
        <a
            className={cn(
                "group flex gap-3 rounded-lg p-3 transition-all duration-200",
                "hover:bg-slate-50 hover:shadow-sm",
                "active:scale-[0.98]",
                className
            )}
            href={href}
            {...props}
        >
            <div className="flex shrink-0 size-11 items-center justify-center rounded-lg bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200/50 group-hover:from-accent/10 group-hover:to-accent/5 group-hover:border-accent/20 transition-all duration-200">
                <Icon className="size-5 text-slate-700 group-hover:text-accent transition-colors duration-200" />
            </div>
            <div className="flex flex-col items-start justify-center min-w-0 flex-1">
                <span className="text-sm font-semibold text-slate-900 group-hover:text-slate-950 transition-colors">
                    {label}
                </span>
                {description && (
                    <span className="line-clamp-2 text-xs text-slate-500 group-hover:text-slate-600 mt-0.5 leading-relaxed">
                        {description}
                    </span>
                )}
            </div>
        </a>
    );
}

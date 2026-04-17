import { Truck } from "lucide-react";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
        <Truck className="h-5 w-5" />
      </div>
      <span className="text-lg font-bold tracking-tight text-foreground">
        Mobi<span className="text-primary">Express</span>
      </span>
    </div>
  );
}

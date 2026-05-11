"use client";

import * as React from "react";
import { FlaskConical, Globe, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { EnvironmentMode, useEnvironment } from "@/contexts/EnvironmentContext";
import { useLocale } from "@/contexts/LocaleContext";
import { cn } from "@/lib/utils";

const ICONS: Record<
  EnvironmentMode,
  React.ComponentType<{ className?: string }>
> = {
  PRODUCTION: Globe,
  SANDBOX: FlaskConical,
  all: Layers,
};

export function EnvironmentToggle() {
  const { t } = useLocale();
  const { environment, setEnvironment } = useEnvironment();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="outline" size="sm" className="h-9 gap-2">
        <Globe className="w-4 h-4" />
      </Button>
    );
  }

  const env = t.dashboard.environment;
  const options: Array<{
    value: EnvironmentMode;
    label: string;
    hint: string;
  }> = [
    { value: "PRODUCTION", label: env.production, hint: env.productionHint },
    { value: "SANDBOX", label: env.sandbox, hint: env.sandboxHint },
    { value: "all", label: env.all, hint: env.allHint },
  ];

  const current = options.find((o) => o.value === environment) ?? options[0];
  const Icon = ICONS[environment];

  const badgeClass =
    environment === "PRODUCTION"
      ? "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20"
      : environment === "SANDBOX"
        ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20"
        : "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 gap-2 border-2 transition-colors"
        >
          <Icon className="w-4 h-4" />
          <span className="hidden sm:inline">{env.label}</span>
          <Badge variant="outline" className={cn("text-xs", badgeClass)}>
            {current.label}
          </Badge>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="font-semibold">
          {env.label}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {options.map((option) => {
          const OptionIcon = ICONS[option.value];
          const isActive = option.value === environment;
          return (
            <DropdownMenuItem
              key={option.value}
              onClick={() => setEnvironment(option.value)}
              className={cn(
                "flex items-start gap-3 py-2.5 cursor-pointer",
                isActive && "bg-accent",
              )}
            >
              <OptionIcon className="w-4 h-4 mt-0.5 shrink-0" />
              <div className="flex-1">
                <div className="font-medium text-sm">{option.label}</div>
                <div className="text-xs text-muted-foreground">
                  {option.hint}
                </div>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

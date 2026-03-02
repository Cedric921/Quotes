"use client";

import { LucideIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  gradient: {
    from: string;
    to: string;
  };
  isLoading?: boolean;
  change?: {
    value: number;
    label: string;
  };
  formatValue?: (value: string | number) => string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  gradient,
  isLoading = false,
  change,
  formatValue,
}: StatCardProps) {
  const displayValue = formatValue ? formatValue(value) : value;

  return (
    <Card
      className={`relative overflow-hidden border-2 hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-${gradient.from}/10 to-${gradient.to}/10`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardDescription className="text-sm font-medium">
            {title}
          </CardDescription>
          <div
            className={`p-2 rounded-lg bg-gradient-to-br from-${gradient.from} to-${gradient.to}`}
          >
            <Icon className="w-5 h-5 text-white" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-3xl font-bold">
            {isLoading ? (
              <div className="h-9 w-24 bg-muted animate-pulse rounded" />
            ) : (
              displayValue
            )}
          </div>
          {change && !isLoading && (
            <div className="flex items-center gap-2">
              <Badge
                className={`${
                  change.value >= 0
                    ? "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20"
                    : "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20"
                } text-xs`}
              >
                {change.value >= 0 ? (
                  <ArrowUpRight className="w-3 h-3 mr-1" />
                ) : (
                  <ArrowDownRight className="w-3 h-3 mr-1" />
                )}
                {change.value >= 0 ? "+" : ""}
                {change.value}%
              </Badge>
              <span className="text-xs text-muted-foreground">
                {change.label}
              </span>
            </div>
          )}
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </CardContent>
      <div
        className={`absolute -right-8 -bottom-8 w-32 h-32 bg-gradient-to-br from-${gradient.from} to-${gradient.to} opacity-10 rounded-full blur-2xl`}
      />
    </Card>
  );
}


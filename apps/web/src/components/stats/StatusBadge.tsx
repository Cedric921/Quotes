"use client";

import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, XCircle, RefreshCw } from "lucide-react";

type PaymentStatus = "SUCCEEDED" | "PENDING" | "FAILED" | "REFUNDED";

interface StatusBadgeProps {
  status: PaymentStatus | string;
  labels?: {
    succeeded?: string;
    pending?: string;
    failed?: string;
    refunded?: string;
  };
}

export function StatusBadge({
  status,
  labels = {
    succeeded: "Réussi",
    pending: "En cours",
    failed: "Échoué",
    refunded: "Remboursé",
  },
}: StatusBadgeProps) {
  switch (status) {
    case "SUCCEEDED":
      return (
        <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">
          <CheckCircle className="w-3 h-3 mr-1" />
          {labels.succeeded}
        </Badge>
      );
    case "PENDING":
      return (
        <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20">
          <Clock className="w-3 h-3 mr-1" />
          {labels.pending}
        </Badge>
      );
    case "FAILED":
      return (
        <Badge className="bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20">
          <XCircle className="w-3 h-3 mr-1" />
          {labels.failed}
        </Badge>
      );
    case "REFUNDED":
      return (
        <Badge className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20">
          <RefreshCw className="w-3 h-3 mr-1" />
          {labels.refunded}
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}


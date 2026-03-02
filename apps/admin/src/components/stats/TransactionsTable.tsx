"use client";

import { Clock } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "./StatusBadge";

interface Transaction {
  id: string;
  userName?: string;
  userEmail?: string;
  planName?: string;
  amount: number;
  date: string;
  status: string;
}

interface TransactionsTableProps {
  transactions: Transaction[];
  isLoading?: boolean;
  emptyMessage?: string;
  labels?: {
    user?: string;
    plan?: string;
    amount?: string;
    date?: string;
    status?: string;
    succeeded?: string;
    pending?: string;
    failed?: string;
  };
}

export function TransactionsTable({
  transactions,
  isLoading = false,
  emptyMessage = "Aucune transaction",
  labels = {},
}: TransactionsTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-12 bg-muted animate-pulse rounded" />
        ))}
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{labels.user || "Utilisateur"}</TableHead>
          <TableHead>{labels.plan || "Plan"}</TableHead>
          <TableHead>{labels.amount || "Montant"}</TableHead>
          <TableHead>{labels.date || "Date"}</TableHead>
          <TableHead>{labels.status || "Statut"}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((transaction) => (
          <TableRow key={transaction.id}>
            <TableCell className="font-medium">
              {transaction.userName || transaction.userEmail || "N/A"}
            </TableCell>
            <TableCell>
              <Badge variant="secondary" className="text-xs">
                {transaction.planName || "N/A"}
              </Badge>
            </TableCell>
            <TableCell className="font-semibold">
              €{(Number(transaction.amount) || 0).toFixed(2)}
            </TableCell>
            <TableCell className="text-muted-foreground text-sm">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(transaction.date).toLocaleDateString()}
              </div>
            </TableCell>
            <TableCell>
              <StatusBadge
                status={transaction.status}
                labels={{
                  succeeded: labels.succeeded,
                  pending: labels.pending,
                  failed: labels.failed,
                }}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

